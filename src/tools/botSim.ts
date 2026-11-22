/**
 * Plays whole games with bots in every seat, across many combinations of expansions, boards and options, to find bugs.
 *
 *   npx tsx src/tools/botSim.ts --mode sweep                  every board, expansion and option on its own, plus player counts
 *   npx tsx src/tools/botSim.ts --mode random --games 200     random combinations
 *   npx tsx src/tools/botSim.ts --mode sink --games 30        everything switched on
 *   npx tsx src/tools/botSim.ts --repro report.json 17        replay job 17 of a report in this process, with stack traces
 *
 * Options: --seed N (default 1), --max-gen N (default 30), --out FILE (default botsim-report.json),
 *          --max-steps N (answers per game before it counts as going in circles, default 20000), --jobs N (parallel workers, default 2), --timeout SEC (per game, default 180), --only TEXT (label filter),
 *          --no-roundtrip (don't reload the game from its last save every generation).
 *
 * What counts as a finding:
 *  - crash: the engine threw something that isn't a rejected answer (TypeError, ...), or the player model the browser
 *    would receive could not be built.
 *  - stuck: every answer the bot tried for one input was rejected.
 *  - blocked: nobody is waiting for anything, yet the game isn't over.
 *  - timeout: a game didn't finish in time (usually an endless loop).
 *  - Every generation the game is reloaded from the engine's latest save (like a server restart) and play continues, so a
 *    save that loses state shows up as a crash, stuck or blocked game.
 * A game that reaches --max-gen without ending is fine ("capped"): random bots rarely finish terraforming.
 */
import {fork} from 'node:child_process';
import * as fs from 'node:fs';
import {BoardName} from '../common/boards/BoardName';
import {DEFAULT_EXPANSIONS, Expansion} from '../common/cards/GameModule';
import {NewGameConfig, NewPlayerModel} from '../common/game/NewGameConfig';
import {RandomMAOptionType} from '../common/ma/RandomMAOptionType';
import {Phase} from '../common/Phase';
import {PLAYER_COLORS} from '../common/Color';
import {SeededRandom} from '../common/utils/Random';
import {generateRandomId} from '../server/utils/server-ids';
import {safeCast, isGameId, isPlayerId, isSpectatorId} from '../common/Types';

// ---------------------------------------------------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------------------------------------------------

type Job = {
  label: string,
  config: NewGameConfig,
  seed: number,
  maxGen: number,
  roundtrip: boolean,
  /** Answers allowed in one game. Real games take a few thousand; more means the game is going around in circles. */
  maxSteps: number,
};

type Finding = {
  kind: 'crash' | 'stuck' | 'blocked' | 'timeout' | 'harness',
  /** Short, de-duplicable description. */
  signature: string,
  message: string,
  stack?: string,
};

type JobResult = {
  index: number,
  label: string,
  status: 'finished' | 'capped' | 'failed',
  generation: number,
  steps: number,
  finding?: Finding,
  answered: Record<string, number>,
  rejections: Record<string, number>,
  /** The top of the stack of the first rejection with each message. */
  origins: Record<string, string>,
  millis: number,
};

const BOARDS: ReadonlyArray<BoardName> = Object.values(BoardName);
const EXPANSION_LIST = Object.keys(DEFAULT_EXPANSIONS) as Array<Expansion>;

/** Expansions that only work with another one. The create-game form ticks these too. */
const NEEDS: Partial<Record<Expansion, Array<Expansion>>> = {
  venusphase2: ['venus'],
  mercury: ['colonies', 'turmoil'],
};

function baseConfig(playerCount: number): NewGameConfig {
  const players: Array<NewPlayerModel> = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({name: `Bot ${i + 1}`, color: PLAYER_COLORS[i], beginner: false, handicap: 0, first: i === 0, bot: true});
  }
  return {
    players,
    expansions: {...DEFAULT_EXPANSIONS},
    boards: [BoardName.THARSIS],
    seed: 0,
    randomFirstPlayer: false,
    clonedGamedId: undefined,
    undoOption: false,
    showTimers: false,
    fastModeOption: false,
    showOtherPlayersVP: false,
    aresExtremeVariant: false,
    politicalAgendasExtension: 'Standard',
    gigaTurmoil: false,
    domesWilderness: false,
    individualTracks: false,
    solarPhaseOption: false,
    removeNegativeGlobalEventsOption: false,
    modularMA: false,
    draftVariant: false,
    initialDraft: false,
    preludeDraftVariant: false,
    ceosDraftVariant: false,
    startingCorporations: 2,
    shuffleMapOption: false,
    randomMA: RandomMAOptionType.NONE,
    includeFanMA: false,
    soloTR: false,
    customCorporationsList: [],
    bannedCards: [],
    includedCards: [],
    customColoniesList: [],
    customPreludes: [],
    requiresMoonTrackCompletion: false,
    requiresVenusTrackCompletion: false,
    moonStandardProjectVariant: false,
    moonStandardProjectVariant1: false,
    altVenusBoard: false,
    altContaminationTrack: false,
    escapeVelocity: undefined,
    twoCorpsVariant: false,
    mergerPlus2P: false,
    customCeos: [],
    startingCeos: 3,
    startingPreludes: 4,
  };
}

function withExpansions(config: NewGameConfig, ...list: Array<Expansion>): NewGameConfig {
  const expansions = {...config.expansions};
  const add = (e: Expansion) => {
    expansions[e] = true;
    NEEDS[e]?.forEach(add);
  };
  list.forEach(add);
  return {...config, expansions};
}

/** One toggle per option, each with the expansion it needs. */
const OPTION_TOGGLES: Array<{name: string, needs?: Array<Expansion>, apply: (c: NewGameConfig) => NewGameConfig, players?: number}> = [
  {name: 'draft', apply: (c) => ({...c, draftVariant: true})},
  {name: 'initialDraft', apply: (c) => ({...c, initialDraft: true})},
  {name: 'preludeDraft', needs: ['prelude'], apply: (c) => ({...c, preludeDraftVariant: true, initialDraft: true})},
  {name: 'ceoDraft', needs: ['ceo'], apply: (c) => ({...c, ceosDraftVariant: true, initialDraft: true})},
  {name: 'solarPhase', apply: (c) => ({...c, solarPhaseOption: true})},
  {name: 'shuffleMap', apply: (c) => ({...c, shuffleMapOption: true})},
  {name: 'randomMA-limited', apply: (c) => ({...c, randomMA: RandomMAOptionType.LIMITED})},
  {name: 'randomMA-full', apply: (c) => ({...c, randomMA: RandomMAOptionType.UNLIMITED})},
  {name: 'modularMA', apply: (c) => ({...c, modularMA: true})},
  {name: 'fanMA', apply: (c) => ({...c, includeFanMA: true})},
  {name: 'aresExtreme', needs: ['ares'], apply: (c) => ({...c, aresExtremeVariant: true})},
  {name: 'gigaTurmoil', needs: ['turmoil'], apply: (c) => ({...c, gigaTurmoil: true})},
  {name: 'agendas-random', needs: ['turmoil'], apply: (c) => ({...c, politicalAgendasExtension: 'Random'})},
  {name: 'agendas-chairman', needs: ['turmoil'], apply: (c) => ({...c, politicalAgendasExtension: 'Chairman'})},
  {name: 'noNegativeEvents', needs: ['turmoil'], apply: (c) => ({...c, removeNegativeGlobalEventsOption: true})},
  {name: 'domesWilderness', apply: (c) => ({...c, domesWilderness: true})},
  {name: 'individualTracks', apply: (c) => ({...c, individualTracks: true})},
  {name: 'moonStdProjects', needs: ['moon'], apply: (c) => ({...c, moonStandardProjectVariant: true})},
  {name: 'moonStdProjects1', needs: ['moon'], apply: (c) => ({...c, moonStandardProjectVariant1: true})},
  {name: 'requireMoon', needs: ['moon'], apply: (c) => ({...c, requiresMoonTrackCompletion: true})},
  {name: 'requireVenus', needs: ['venus'], apply: (c) => ({...c, requiresVenusTrackCompletion: true})},
  {name: 'altVenusBoard', needs: ['venus'], apply: (c) => ({...c, altVenusBoard: true})},
  {name: 'altContamination', needs: ['nuclear'], apply: (c) => ({...c, altContaminationTrack: true})},
  {name: 'twoCorps', apply: (c) => ({...c, twoCorpsVariant: true})},
  {name: 'mergerPlus2P', needs: ['prelude'], apply: (c) => ({...c, mergerPlus2P: true}), players: 2},
  {name: 'soloTR', apply: (c) => ({...c, soloTR: true}), players: 1},
  {name: 'undo', apply: (c) => ({...c, undoOption: true})},
  {name: 'fastMode', apply: (c) => ({...c, fastModeOption: true})},
  {name: 'startingCorps4', apply: (c) => ({...c, startingCorporations: 4})},
];

function sweepJobs(): Array<{label: string, config: NewGameConfig}> {
  const jobs: Array<{label: string, config: NewGameConfig}> = [];
  jobs.push({label: 'base 2p', config: baseConfig(2)});
  for (const n of [1, 3, 4, 5, 6]) {
    jobs.push({label: `players ${n}`, config: baseConfig(n)});
  }
  for (const board of BOARDS) {
    jobs.push({label: `board ${board}`, config: {...baseConfig(2), boards: [board]}});
  }
  for (const e of EXPANSION_LIST) {
    jobs.push({label: `expansion ${e}`, config: withExpansions(baseConfig(2), e)});
  }
  for (const toggle of OPTION_TOGGLES) {
    const config = withExpansions(toggle.apply(baseConfig(toggle.players ?? 2)), ...(toggle.needs ?? []));
    jobs.push({label: `option ${toggle.name}`, config});
  }
  // Pairs that matter: the fan modules that lean on each other.
  jobs.push({label: 'giga turmoil + rob/solaris/ides', config: withExpansions({...baseConfig(3), gigaTurmoil: true}, 'turmoil', 'robantilles', 'solaris', 'idesofmars')});
  jobs.push({label: 'postludes + highorbit + industries', config: withExpansions(baseConfig(2), 'postludes', 'highorbit', 'industries')});
  jobs.push({label: 'giga board', config: {...withExpansions(baseConfig(3), 'postludes', 'industries'), boards: [BoardName.GIGA], individualTracks: true}});
  return jobs;
}

function randomJobs(count: number, rng: SeededRandom, allOn: boolean): Array<{label: string, config: NewGameConfig}> {
  const jobs: Array<{label: string, config: NewGameConfig}> = [];
  for (let i = 0; i < count; i++) {
    let config = baseConfig(allOn ? 2 + rng.nextInt(5) : 1 + rng.nextInt(6));
    const chosen = EXPANSION_LIST.filter(() => allOn || rng.next() < 0.4);
    config = withExpansions(config, ...chosen);
    config = {...config, boards: [BOARDS[rng.nextInt(BOARDS.length)]]};
    const applied: Array<string> = [];
    for (const toggle of OPTION_TOGGLES) {
      if (toggle.players !== undefined) {
        continue; // They fix the player count.
      }
      if (allOn || rng.next() < 0.25) {
        if ((toggle.needs ?? []).every((e) => config.expansions[e])) {
          config = toggle.apply(config);
          applied.push(toggle.name);
        }
      }
    }
    const on = EXPANSION_LIST.filter((e) => config.expansions[e]);
    jobs.push({label: `${allOn ? 'sink' : 'random'} ${i}: ${config.players.length}p ${config.boards[0]} [${on.join(',')}] {${applied.join(',')}}`, config});
  }
  return jobs;
}

// ---------------------------------------------------------------------------------------------------------------------
// Running one game (worker side)
// ---------------------------------------------------------------------------------------------------------------------

/** "at Foo.bar (/x/src/server/cards/Baz.ts:12:3)" lines from our own code, first three. */
function ourFrames(stack: string | undefined): string {
  return (stack ?? '').split('\n')
    .filter((line) => line.includes('/src/') && !line.includes('/bots/') && !line.includes('node_modules'))
    .slice(0, 3)
    .map((line) => line.trim().replace(/^at /, '').replace(/\(.*\/src\//, '(src/').replace(/^.*\/src\//, 'src/'))
    .join(' < ');
}

function describeError(e: unknown): {name: string, message: string, stack?: string} {
  if (e instanceof Error) {
    // A "stuck" bot reports the error that kept rejecting it: that is where the problem is.
    if (e.cause instanceof Error) {
      return {name: e.cause.name, message: `${e.message}`, stack: e.cause.stack};
    }
    return {name: e.name, message: e.message, stack: e.stack};
  }
  return {name: 'Error', message: String(e)};
}

/** The engine's global setup may run once per process, and a worker plays many games. */
let initialized = false;

async function runJob(job: Job, index: number): Promise<JobResult> {
  // Imported here so the orchestrator process doesn't load the whole game.
  const {globalInitialize} = await import('../server/globalInitialize');
  const {Database} = await import('../server/database/Database');
  const {Game} = await import('../server/Game');
  const {Player} = await import('../server/Player');
  const {Server} = await import('../server/models/ServerModel');
  const {gameOptionsFromConfig} = await import('../server/game/GameOptionsFromConfig');
  const {BotDriver, BotStuckError} = await import('../server/bots/BotDriver');
  const {RandomBot, UnsupportedInputError} = await import('../server/bots/RandomBot');

  const started = Date.now();
  if (!initialized) {
    initialized = true;
    globalInitialize();
  }
  const lists = new Set(['getGameIds', 'getSaveIds', 'getParticipants', 'getSessions', 'purgeUnfinishedGames']);
  // The most recent save the engine made: what a server restarted right now would load.
  let lastSave: string | undefined;
  const fakeDatabase: any = new Proxy({}, {
    get: (_, name: string) => {
      if (name === 'saveGame') {
        return (saved: {serialize(): unknown}) => {
          if (job.roundtrip) {
            lastSave = JSON.stringify(saved.serialize());
          }
          return Promise.resolve();
        };
      }
      return () => Promise.resolve(lists.has(name) ? [] : undefined);
    },
  });
  Database.getInstance = () => fakeDatabase;

  // The engine calls Math.random in places the game seed doesn't reach. Seeding it makes a game replay exactly, which
  // is what --repro relies on.
  const engineRandom = new SeededRandom(job.seed * 0.9 + 0.05);
  Math.random = () => engineRandom.next();

  const rng = new SeededRandom(job.seed);
  const driver = new BotDriver(new RandomBot(rng));
  let steps = 0;
  let generation = 1;
  let finding: Finding | undefined;
  let status: JobResult['status'] = 'finished';
  const fail = (kind: Finding['kind'], e: unknown) => {
    const d = describeError(e);
    const where = ourFrames(d.stack);
    // Numbers differ between runs of the same bug; keep the signature stable.
    const msg = d.message.replace(/\d+/g, 'N').slice(0, 120);
    finding = {kind, signature: `${kind}: ${d.name}: ${msg}${where ? ' @ ' + where : ''}`, message: d.message, stack: d.stack};
    status = 'failed';
  };

  try {
    const config = job.config;
    const players = config.players.map((p) => {
      const player = new Player(p.name, p.color, p.beginner, p.handicap, safeCast(generateRandomId('p'), isPlayerId));
      player.isBot = true;
      return player;
    });
    const options = gameOptionsFromConfig(config, config.boards[0]);
    let game: ReturnType<typeof Game.deserialize> = Game.newInstance(
      safeCast(generateRandomId('g'), isGameId), players, players[0], safeCast(generateRandomId('s'), isSpectatorId), options, job.seed);

    const isOver = () => game.phase === Phase.END;
    while (!isOver() && game.generation <= job.maxGen) {
      if (steps >= job.maxSteps) {
        fail('blocked', new Error(`Livelock: ${steps} answers without finishing generation ${game.generation} (phase '${game.phase}')`));
        break;
      }
      // What a browser polling this player would be sent. A crash here would break the page for a human.
      const waiting = BotDriver.waitingBot(game);
      if (waiting === undefined) {
        fail('blocked', new Error(`No player is waiting in phase '${game.phase}', generation ${game.generation}`));
        break;
      }
      try {
        Server.getPlayerModel(waiting);
      } catch (e) {
        fail('crash', Object.assign(new Error(`getPlayerModel: ${describeError(e).message}`), {stack: describeError(e).stack}));
        break;
      }

      driver.step(game);
      steps++;

      if (game.generation !== generation) {
        generation = game.generation;
        if (process.env.BOTSIM_TRACE !== undefined) {
          console.error(`[trace] generation ${generation} after ${steps} answers, ${Date.now() - started} ms`);
        }
        try {
          for (const p of game.players) {
            Server.getPlayerModel(p);
          }
          if (job.roundtrip && !isOver() && lastSave !== undefined) {
            // Like a server restart: carry on from what was last saved, not from the live objects.
            const reloaded = Game.deserialize(JSON.parse(lastSave));
            game = reloaded;
            generation = game.generation;
          }
        } catch (e) {
          fail('crash', e);
          break;
        }
      }
    }
    if (finding === undefined && !isOver()) {
      status = 'capped';
    }
    if (finding === undefined && isOver()) {
      Server.getPlayerModel(game.players[0]);
    }
  } catch (e) {
    if (e instanceof BotStuckError) {
      fail('stuck', e);
    } else if (e instanceof UnsupportedInputError) {
      fail('harness', e);
    } else {
      fail('crash', e);
    }
  }

  return {
    index,
    label: job.label,
    status,
    generation,
    steps,
    finding,
    answered: Object.fromEntries(driver.answered),
    rejections: Object.fromEntries(driver.rejections),
    origins: Object.fromEntries(driver.rejectionOrigins),
    millis: Date.now() - started,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------------------------------------------------

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function workerMain() {
  const send = (message: unknown) => {
    if (process.send === undefined) {
      throw new Error('botSim worker was not started with an IPC channel');
    }
    process.send(message);
  };
  process.on('message', async (msg: {job: Job, index: number}) => {
    send(await runJob(msg.job, msg.index));
  });
  send({ready: true});
}

type Slot = {child: ReturnType<typeof fork>, jobsRun: number};

function spawnWorker(): Promise<Slot> {
  return new Promise((resolve) => {
    const child = fork(process.argv[1], ['--worker'], {stdio: ['ignore', 'ignore', 'inherit', 'ipc']});
    child.once('message', () => resolve({child, jobsRun: 0}));
  });
}

async function runPool(jobs: Array<Job>, concurrency: number, timeoutMs: number): Promise<Array<JobResult>> {
  const results: Array<JobResult> = new Array(jobs.length);
  let next = 0;
  let done = 0;

  async function slotLoop() {
    let slot = await spawnWorker();
    while (next < jobs.length) {
      const index = next++;
      const job = jobs[index];
      const result = await new Promise<JobResult>((resolve) => {
        const timer = setTimeout(() => {
          slot.child.kill('SIGKILL');
          resolve({
            index, label: job.label, status: 'failed', generation: 0, steps: 0, answered: {}, rejections: {}, origins: {}, millis: timeoutMs,
            finding: {kind: 'timeout', signature: `timeout: no result within ${timeoutMs / 1000}s`, message: 'The game did not finish in time (an endless loop?)'},
          });
        }, timeoutMs);
        const onMessage = (r: JobResult) => {
          cleanup();
          resolve(r);
        };
        const onExit = () => {
          cleanup();
          resolve({
            index, label: job.label, status: 'failed', generation: 0, steps: 0, answered: {}, rejections: {}, origins: {}, millis: 0,
            finding: {kind: 'crash', signature: 'crash: worker process died', message: 'The worker exited (out of memory?)'},
          });
        };
        const cleanup = () => {
          clearTimeout(timer);
          slot.child.off('message', onMessage);
          slot.child.off('exit', onExit);
        };
        slot.child.on('message', onMessage);
        slot.child.on('exit', onExit);
        slot.child.send({job, index});
      });
      results[index] = result;
      done++;
      const mark = result.status === 'failed' ? 'FAIL' : result.status === 'finished' ? 'done' : 'cap ';
      console.log(`[${done}/${jobs.length}] ${mark} gen ${String(result.generation).padStart(2)} ${String(result.steps).padStart(5)} steps ${(result.millis / 1000).toFixed(1).padStart(5)}s  ${result.label}${result.finding ? '\n        ' + result.finding.signature : ''}`);
      slot.jobsRun++;
      if (result.status === 'failed' || slot.jobsRun >= 25) {
        slot.child.kill('SIGKILL');
        slot = await spawnWorker();
      }
    }
    slot.child.kill('SIGKILL');
  }

  await Promise.all(Array.from({length: concurrency}, slotLoop));
  return results;
}

function summarize(results: Array<JobResult>) {
  const count = (s: JobResult['status']) => results.filter((r) => r.status === s).length;
  console.log(`\n${results.length} games: ${count('finished')} finished, ${count('capped')} hit the generation cap, ${count('failed')} failed.`);

  const groups = new Map<string, Array<JobResult>>();
  for (const r of results) {
    if (r.finding === undefined) {
      continue;
    }
    const key = r.finding.signature;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  if (groups.size > 0) {
    console.log(`\n${groups.size} distinct problem(s):`);
    [...groups.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([signature, rs], i) => {
      console.log(`\n${i + 1}. [${rs.length}x] ${signature}`);
      console.log(`   e.g. job ${rs[0].index}: ${rs[0].label}`);
    });
  }

  const answered: Record<string, number> = {};
  const rejections: Record<string, number> = {};
  const origins: Record<string, string> = {};
  for (const r of results) {
    Object.assign(origins, r.origins ?? {});
    for (const [k, v] of Object.entries(r.answered)) {
      answered[k] = (answered[k] ?? 0) + v;
    }
    for (const [k, v] of Object.entries(r.rejections)) {
      rejections[k] = (rejections[k] ?? 0) + v;
    }
  }
  console.log('\nInputs answered, by kind:');
  Object.entries(answered).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(8)}  ${k}`));
  const topRejections = Object.entries(rejections).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (topRejections.length > 0) {
    console.log('\nMost common non-InputError rejections (the bot guessing wrong, mostly):');
    topRejections.forEach(([k, v]) => console.log(`  ${String(v).padStart(8)}  ${k.slice(0, 110)}\n            ${(origins[k] ?? '').slice(0, 260)}`));
  }
}

async function main() {
  if (flag('worker')) {
    return workerMain();
  }

  const seed = Number(arg('seed', '1'));
  const maxGen = Number(arg('max-gen', '30'));
  const roundtrip = !flag('no-roundtrip');

  const repro = arg('repro');
  if (repro !== undefined) {
    const report = JSON.parse(fs.readFileSync(repro, 'utf8'));
    const index = Number(process.argv[process.argv.indexOf('--repro') + 2]);
    const job: Job = report.jobs[index];
    const result = await runJob(job, index);
    console.log(JSON.stringify({...result, finding: undefined}, null, 1));
    if (result.finding) {
      console.log(`\n${result.finding.signature}\n\n${result.finding.stack ?? result.finding.message}`);
    }
    return;
  }

  const mode = arg('mode', 'sweep');
  const games = Number(arg('games', '50'));
  const rng = new SeededRandom(seed);
  let configs: Array<{label: string, config: NewGameConfig}>;
  switch (mode) {
  case 'sweep': configs = sweepJobs(); break;
  case 'random': configs = randomJobs(games, rng, false); break;
  case 'sink': configs = randomJobs(games, rng, true); break;
  default: throw new Error(`Unknown --mode ${mode}`);
  }
  const only = arg('only');
  if (only !== undefined) {
    configs = configs.filter((c) => c.label.includes(only));
  }
  const jobs: Array<Job> = configs.map((c, i) => ({...c, seed: (seed * 7919 + i * 104729) % 1000003 / 1000003, maxGen, roundtrip, maxSteps: Number(arg('max-steps', '20000'))}));
  console.log(`Running ${jobs.length} games (${mode}, seed ${seed}, up to generation ${maxGen}).`);

  const results = await runPool(jobs, Number(arg('jobs', '2')), Number(arg('timeout', '180')) * 1000);
  summarize(results);

  const out = arg('out', 'botsim-report.json') ?? 'botsim-report.json';
  fs.writeFileSync(out, JSON.stringify({mode, seed, maxGen, jobs, results}, null, 1));
  console.log(`\nFull report: ${out} (replay one game: npx tsx src/tools/botSim.ts --repro ${out} <job number>)`);
  process.exit(results.some((r) => r.status === 'failed') ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
