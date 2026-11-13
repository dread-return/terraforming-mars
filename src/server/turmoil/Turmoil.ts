import {GIGA_PARTIES, GIGA_PARTIES_IN_PLAY, OFFICIAL_PARTIES, PartyName} from '../../common/turmoil/PartyName';
import {IParty} from './parties/IParty';
import {MarsFirst} from './parties/MarsFirst';
import {Scientists} from './parties/Scientists';
import {Unity} from './parties/Unity';
import {Kelvinists} from './parties/Kelvinists';
import {Reds} from './parties/Reds';
import {Greens} from './parties/Greens';
import {chairmanWheelInput} from './ChairmanWheel';
import {GigaMarsFirst} from './giga/GigaMarsFirst';
import {GigaScientists} from './giga/GigaScientists';
import {GigaUnity} from './giga/GigaUnity';
import {GigaKelvinists} from './giga/GigaKelvinists';
import {GigaReds} from './giga/GigaReds';
import {GigaGreens} from './giga/GigaGreens';
import {GigaSpome} from './giga/GigaSpome';
import {GigaBureaucrats} from './giga/GigaBureaucrats';
import {GigaEmpower} from './giga/GigaEmpower';
import {GigaPopulists} from './giga/GigaPopulists';
import {GigaCentrists} from './giga/GigaCentrists';
import {GigaTranshumanists} from './giga/GigaTranshumanists';
import {GigaHooks} from './giga/GigaHooks';
import {PartyDraftState} from './giga/PartyDraft';
import {IGame} from '../IGame';
import {GlobalEventDealer, getGlobalEventByName} from './globalEvents/GlobalEventDealer';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {SerializedDelegate, SerializedTurmoil} from './SerializedTurmoil';
import {DELEGATES_FOR_NEUTRAL_PLAYER, DELEGATES_PER_PLAYER} from '../../common/constants';
import {PoliticalAgendasData, PoliticalAgendas} from './PoliticalAgendas';
import {AgendaStyle, PolicyId} from '../../common/turmoil/Types';
import {CardName} from '../../common/cards/CardName';
import {MultiSet} from 'mnemonist';
import {IPlayer} from '../IPlayer';
import {SendDelegateToArea} from '../deferredActions/SendDelegateToArea';
import {SelectParty} from '../inputs/SelectParty';
import {IPolicy, policyDescription} from './Policy';
import {PlayerId} from '../../common/Types';
import {ChoosePolicyBonus} from '../deferredActions/ChoosePolicyBonus';
import {toID} from '../../common/utils/utils';
import {IdesOfMars} from '../cards/idesofmars/IdesOfMars';

export type NeutralPlayer = 'NEUTRAL';
export type Delegate = IPlayer | NeutralPlayer;

export type PartyFactory = new() => IParty;

/** The six parties of the standard Turmoil expansion. */
export const ALL_PARTIES = {
  [PartyName.MARS]: MarsFirst,
  [PartyName.SCIENTISTS]: Scientists,
  [PartyName.UNITY]: Unity,
  [PartyName.GREENS]: Greens,
  [PartyName.REDS]: Reds,
  [PartyName.KELVINISTS]: Kelvinists,
} satisfies Partial<Record<PartyName, PartyFactory>>;

/**
 * Giga Turmoil follows the Epic rules. All twelve parties have their own bonuses and policies, including the
 * six standard parties, which use different ones than in a standard game.
 */
export const ALL_GIGA_PARTIES = {
  [PartyName.MARS]: GigaMarsFirst,
  [PartyName.SCIENTISTS]: GigaScientists,
  [PartyName.UNITY]: GigaUnity,
  [PartyName.GREENS]: GigaGreens,
  [PartyName.REDS]: GigaReds,
  [PartyName.KELVINISTS]: GigaKelvinists,
  [PartyName.SPOME]: GigaSpome,
  [PartyName.BUREAUCRATS]: GigaBureaucrats,
  [PartyName.EMPOWER]: GigaEmpower,
  [PartyName.POPULISTS]: GigaPopulists,
  [PartyName.CENTRISTS]: GigaCentrists,
  [PartyName.TRANSHUMANISTS]: GigaTranshumanists,
} satisfies Record<PartyName, PartyFactory>;

// The order of the parties on the board. The standard parties come first.
export const BOARD_ORDER: ReadonlyArray<PartyName> = [...OFFICIAL_PARTIES, ...GIGA_PARTIES];

function createParty(name: PartyName, giga: boolean): IParty {
  if (giga) {
    return new ALL_GIGA_PARTIES[name]();
  }
  if (!(name in ALL_PARTIES)) {
    throw new Error(`Party ${name} is only available in Giga Turmoil`);
  }
  return new ALL_PARTIES[name as keyof typeof ALL_PARTIES]();
}

/** The parties of a standard Turmoil game. */
function createParties(): ReadonlyArray<IParty> {
  return OFFICIAL_PARTIES.map((name) => createParty(name, false));
}

const UNINITIALIZED_POLITICAL_AGENDAS_DATA: PoliticalAgendasData = {
  agendas: new Map(),
  agendaStyle: 'Chairman',
};

export class Turmoil {
  public chairman: undefined | Delegate = undefined;
  public rulingParty: IParty;
  public dominantParty: IParty;
  public usedFreeDelegateAction = new Set<IPlayer>();
  public delegateReserve = new MultiSet<Delegate>();
  /**
   * The parties in play. Normally the six standard parties; in Giga Turmoil, the six that were drafted. While
   * that draft is still going on, all twelve.
   */
  public parties: ReadonlyArray<IParty> = createParties();
  /**
   * Parties that are not in this game. Cards and global events may still name them, so they can be looked up,
   * but they never get delegates, never rule and never show up on the board.
   */
  private dormantParties: ReadonlyArray<IParty> = [];
  /** True when playing with Giga Turmoil: the chairman picks a bonus *and* a policy, and a reward from the chairman wheel. */
  public gigaTurmoil: boolean = false;
  /** Giga Turmoil: the state of the party draft at the start of the game. Undefined once it is over. */
  public partyDraft: PartyDraftState | undefined = undefined;
  public playersInfluenceBonus = new Map<PlayerId, number>();
  public readonly globalEventDealer: GlobalEventDealer;
  public distantGlobalEvent: IGlobalEvent | undefined;
  public comingGlobalEvent: IGlobalEvent | undefined;
  public currentGlobalEvent: IGlobalEvent | undefined;
  public politicalAgendasData: PoliticalAgendasData = UNINITIALIZED_POLITICAL_AGENDAS_DATA;

  private constructor(
    rulingPartyName: PartyName,
    chairman: Delegate,
    dominantPartyName: PartyName,
    globalEventDealer: GlobalEventDealer,
    partiesInPlay?: ReadonlyArray<PartyName>,
    gigaTurmoil: boolean = false) {
    this.gigaTurmoil = gigaTurmoil;
    if (partiesInPlay !== undefined) {
      this.setPartiesInPlay(partiesInPlay);
    }
    this.rulingParty = this.getPartyByName(rulingPartyName);
    this.chairman = chairman;
    this.dominantParty = this.getPartyByName(dominantPartyName);
    this.globalEventDealer = globalEventDealer;
  }

  public static newInstance(game: IGame, agendaStyle: AgendaStyle = 'Standard', gigaTurmoil: boolean = false): Turmoil {
    const dealer = GlobalEventDealer.newInstance(game);

    // The game begins with Greens in power and a Neutral chairman
    const turmoil = new Turmoil(PartyName.GREENS, 'NEUTRAL', PartyName.GREENS, dealer);

    // Init parties
    if (gigaTurmoil) {
      // All twelve parties stay on the table until the party draft picks six of them. The first government,
      // the starting agendas and the first global events wait for the draft, see startGigaGovernment.
      turmoil.gigaTurmoil = true;
      turmoil.setPartiesInPlay(BOARD_ORDER);
    } else {
      turmoil.parties = createParties();
    }

    game.playersInGenerationOrder.forEach((player) => {
      turmoil.delegateReserve.add(player, DELEGATES_PER_PLAYER);
    });
    // One Neutral delegate is already Chairman
    turmoil.delegateReserve.add('NEUTRAL', DELEGATES_FOR_NEUTRAL_PLAYER - 1);

    if (gigaTurmoil) {
      // Giga Turmoil always uses the chairman agenda style.
      turmoil.politicalAgendasData = PoliticalAgendas.newInstance('Standard', turmoil.parties);
      turmoil.politicalAgendasData.agendaStyle = 'Chairman';
      return turmoil;
    }

    game.log('A neutral delegate is the new chairman.');
    game.log('${0} are in power in the first generation.', (b) => b.party(turmoil.rulingParty));

    turmoil.politicalAgendasData = PoliticalAgendas.newInstance(agendaStyle, turmoil.parties);
    // Note: this call relies on an instance of Game that will not be fully formed.
    // TODO(kberg): split newInstance into create/set-up so this can be done once the whole thing is ready.
    turmoil.onAgendaSelected(game);
    turmoil.initGlobalEvent(game);
    return turmoil;
  }

  /**
   * Giga Turmoil: the party draft is over, so start the first government with the six parties that were chosen.
   *
   * The starting party is random, and so are the starting bonus and policy of every party.
   */
  public startGigaGovernment(game: IGame, names: ReadonlyArray<PartyName>): void {
    this.setPartiesInPlay(names);
    this.partyDraft = undefined;
    game.log('Giga Turmoil parties: ${0}', (b) => b.rawString(this.parties.map((p) => p.name).join(', ')));

    this.politicalAgendasData = PoliticalAgendas.newInstance('Random', this.parties);
    this.politicalAgendasData.agendaStyle = 'Chairman';

    const startingParty = this.parties[game.rng.nextInt(this.parties.length)];
    this.rulingParty = startingParty;
    this.dominantParty = startingParty;

    game.log('A neutral delegate is the new chairman.');
    game.log('${0} are in power in the first generation.', (b) => b.party(startingParty));

    this.onAgendaSelected(game);
    this.initGlobalEvent(game);
  }

  /** Giga Turmoil: true until the party draft has chosen the parties in play. */
  public awaitingPartyDraft(): boolean {
    return this.gigaTurmoil && this.parties.length > GIGA_PARTIES_IN_PLAY;
  }

  public static getTurmoil(game: IGame): Turmoil {
    if (game.turmoil === undefined) {
      throw new Error(`Assertion failure: game.turmoil not defined for ${game.id}`);
    }
    return game.turmoil;
  }

  public initGlobalEvent(game: IGame) {
    // Draw the first global event to setup the game
    this.comingGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.comingGlobalEvent?.revealedDelegate, game);
    this.distantGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.distantGlobalEvent?.revealedDelegate, game);
  }

  /** Sets which parties are in play. The rest become dormant. Call this during setup: it replaces the parties and their delegates. */
  public setPartiesInPlay(names: ReadonlyArray<PartyName>): void {
    this.parties = BOARD_ORDER.filter((name) => names.includes(name)).map((name) => createParty(name, this.gigaTurmoil));
    // A standard game only knows the six official parties, and always plays all of them.
    const known = this.gigaTurmoil ? BOARD_ORDER : OFFICIAL_PARTIES;
    this.dormantParties = known.filter((name) => !names.includes(name)).map((name) => createParty(name, this.gigaTurmoil));
  }

  /** True when `name` is one of the parties in this game. */
  public isInPlay(name: PartyName): boolean {
    return this.parties.some((party) => party.name === name);
  }

  public getPartyByName(name: PartyName): IParty {
    const party = this.parties.find((party) => party.name === name) ?? this.dormantParties.find((party) => party.name === name);
    if (party === undefined) {
      throw new Error(`Cannot find party with name {${name}}`);
    }
    return party;
  }

  rulingPolicy(): IPolicy {
    const rulingParty = this.rulingParty;
    const rulingPolicyId: PolicyId = PoliticalAgendas.currentAgenda(this).policyId;
    const policy = rulingParty.policies.find((policy) => policy.id === rulingPolicyId);
    if (policy === undefined) {
      throw new Error(`Policy ${rulingPolicyId} not found in ${rulingParty.name}`);
    }
    return policy;
  }

  public sendDelegateToParty(delegate: Delegate, partyName: PartyName, game: IGame, throwIfError = false): void {
    const party = this.getPartyByName(partyName);
    if (!this.isInPlay(partyName)) {
      // The party is not in this game (Giga Turmoil), so there is nowhere to send the delegate.
      return;
    }
    if (this.delegateReserve.has(delegate)) {
      this.delegateReserve.remove(delegate);
    } else {
      const name = delegate === 'NEUTRAL' ? delegate : delegate.name;
      console.log(`${name}/${game.id} tried to get a delegate from an empty reserve.`);
      if (throwIfError) {
        throw new Error('No available delegate');
      }
      return;
    }
    party.sendDelegate(delegate, game);
    this.checkDominantParty();
    if (delegate !== 'NEUTRAL') {
      GigaHooks.onDelegatePlaced(delegate);
    }
  }

  /**
   * Remove one `delegate` from `partyName`.
   *
   * Will re-evaluate the dominant party.
   */
  public removeDelegateFromParty(delegate: Delegate, partyName: PartyName, game: IGame): void {
    const party = this.getPartyByName(partyName);
    this.delegateReserve.add(delegate);
    party.removeDelegate(delegate, game);
    this.checkDominantParty();
  }

  /**
   * Replace one `outgoingDelegate` delegate with one `incomingDelegate` in `party` without changing
   * dominance. (I don't think it prevents checking dominance, really.)
   */
  public replaceDelegateFromParty(
    outgoingDelegate: Delegate,
    incomingDelegate: Delegate,
    partyName: PartyName,
    game: IGame): void {
    const party = this.getPartyByName(partyName);
    this.delegateReserve.add(outgoingDelegate);
    party.removeDelegate(outgoingDelegate, game);
    this.sendDelegateToParty(incomingDelegate, partyName, game);
  }

  /**
   * Updates the dominant party. Called as part of delegate changes.
   */
  public checkDominantParty(): void {
    // If there is a dominant party
    const sortParties = this.parties.toSorted(
      (p1, p2) => p2.delegates.size - p1.delegates.size,
    );
    const max = sortParties[0].delegates.size;
    if (this.dominantParty.delegates.size !== max) {
      this.setNextPartyAsDominant(this.dominantParty);
    }
  }

  /**
   * Set the next dominanant party taking into account that
   * `currentDominantParty` is the current dominant party, taking
   * clockwise order into account.
   */
  // Function to get next dominant party taking into account the clockwise order
  private setNextPartyAsDominant(currentDominantParty: IParty) {
    const sortParties = this.parties.toSorted(
      (p1, p2) => p2.delegates.size - p1.delegates.size,
    );
    const max = sortParties[0].delegates.size;

    const currentIndex = this.parties.indexOf(currentDominantParty);

    let partiesToCheck = [];

    // Manage if it's the first party or the last
    if (currentIndex === 0) {
      partiesToCheck = this.parties.slice(currentIndex + 1);
    } else if (currentIndex === this.parties.length - 1) {
      partiesToCheck = this.parties.slice(0, currentIndex);
    } else {
      const left = this.parties.slice(0, currentIndex);
      const right = this.parties.slice(currentIndex + 1);
      partiesToCheck = right.concat(left);
    }

    // Take the clockwise order
    const partiesOrdered = partiesToCheck.reverse();

    partiesOrdered.some((newParty) => {
      if (newParty.delegates.size === max) {
        this.dominantParty = newParty;
        return true;
      }
      return false;
    });
  }

  /**
   * Run the turmoil phase.
   *
   * The global event may add deferred actions, which are resolved before the new government
   * starts. `cb` is called once the new government is in place.
   */
  public runTurmoilPhase(game: IGame, cb: () => void = () => {}): void {
    // 1 - All player lose 1 TR
    game.log('All players lose 1:i:tr:.');
    game.players.forEach((player) => {
      player.decreaseTerraformRating();
    });

    // 2 - Global Event
    if (this.currentGlobalEvent !== undefined) {
      const currentGlobalEvent: IGlobalEvent = this.currentGlobalEvent;
      game.log('Resolving global event ${0}', (b) => b.globalEvent(currentGlobalEvent));
      currentGlobalEvent.resolve(game);
    }

    game.deferredActions.runAll(() => {
      this.finishTurmoilPhase(game);
      cb();
    });
  }

  private finishTurmoilPhase(game: IGame): void {
    // 3 - New Government

    // 3.a - Ruling Policy change
    this.setRulingParty(game);

    // 3.b - New dominant party
    this.setNextPartyAsDominant(this.rulingParty);

    // 3.c - Fill the lobby
    this.usedFreeDelegateAction.clear();

    // 4 - Changing Time
    if (this.currentGlobalEvent) {
      this.globalEventDealer.discard(this.currentGlobalEvent);
    }
    // 4.a - Coming Event is now Current event. Add neutral delegate.
    this.currentGlobalEvent = this.comingGlobalEvent;
    this.addNeutralDelegate(this.currentGlobalEvent?.currentDelegate, game);
    // 4.b - Distant Event is now Coming Event
    this.comingGlobalEvent = this.distantGlobalEvent;
    // 4.c - Draw the new distant event and add neutral delegate
    this.distantGlobalEvent = this.globalEventDealer.draw();
    this.addNeutralDelegate(this.distantGlobalEvent?.revealedDelegate, game);

    // Behold The Emperor hook
    game.beholdTheEmperor = false;
  }

  private addNeutralDelegate(partyName: PartyName | undefined, game: IGame) {
    if (partyName) {
      let target = partyName;
      if (!this.isInPlay(partyName)) {
        // Giga Turmoil: the party was not drafted, so the neutral delegate goes to a random party in play.
        target = this.parties[game.rng.nextInt(this.parties.length)].name;
        game.log('The ${0} party is not in this game, so its neutral delegate goes to a random party instead', (b) => b.partyName(partyName));
      }
      this.sendDelegateToParty('NEUTRAL', target, game);
      game.log('A neutral delegate was added to the ${0} party', (b) => b.partyName(target));
    }
  }

  private executeAlliedOnPolicyEnd(player: IPlayer | undefined): void {
    const alliedParty = player?.alliedParty;
    if (alliedParty) {
      const realPolicy = Turmoil.getTurmoil(player.game).getPartyByName(alliedParty.partyName);
      const alliedPolicy = realPolicy.policies.find((p) => p.id === alliedParty.agenda.policyId);
      if (alliedPolicy) {
        alliedPolicy.onPolicyEndForPlayer?.(player);
      }
    }
  }

  /**
   * Set the next ruling party as part of the Turmoil phase.
   */
  public setRulingParty(game: IGame): void {
    this.rulingPolicy().onPolicyEnd?.(game);

    // Mars Frontier Alliance ends allied party policy
    const alliedPlayer = game.players.find((p) => p.alliedParty !== undefined);
    this.executeAlliedOnPolicyEnd(alliedPlayer);

    // Behold the Emperor Hook prevents changing the ruling party.
    if (game.beholdTheEmperor !== true) {
      this.rulingParty = this.dominantParty;
    }

    let newChairman = this.rulingParty.partyLeader || 'NEUTRAL';
    if (game.beholdTheEmperor === true && this.chairman !== undefined) {
      newChairman = this.chairman;
    }

    // Backstabbing (Ides of Mars): a player with a delegate in the winning party becomes chairman instead.
    let backstabber: IPlayer | undefined;
    if (game.beholdTheEmperor !== true) {
      const rulingParty = this.rulingParty;
      backstabber = IdesOfMars.backstabber(game, (player) => rulingParty.delegates.has(player));
      if (backstabber !== undefined && backstabber !== newChairman) {
        const player = backstabber;
        game.log('${0} backstabbed the party leader and becomes chairman (${1})', (b) => b.player(player).cardName(CardName.BACKSTABBING));
        newChairman = player;
      }
    }

    if (game.beholdTheEmperor !== true) {
      // Fill the delegate reserve with everyone except the new chairman (normally the party leader)
      if (backstabber !== undefined) {
        this.rulingParty.delegates.remove(backstabber);
      } else if (this.rulingParty.partyLeader !== undefined) {
        this.rulingParty.delegates.remove(this.rulingParty.partyLeader);
      }
      this.rulingParty.delegates.forEachMultiplicity((count, playerId) => {
        this.delegateReserve.add(playerId, count);
      });

      // Clean the party
      this.rulingParty.partyLeader = undefined;
      this.rulingParty.delegates.clear();
    }
    this.setNewChairman(newChairman, game, /* setAgenda*/ true);
  }

  public setNewChairman(newChairman : Delegate, game: IGame, setAgenda: boolean = true, gainTR: boolean = true) {
    // Change the chairman
    if (this.chairman && game.beholdTheEmperor !== true) {
      // Return the current Chairman to reserve
      this.delegateReserve.add(this.chairman);
    }
    this.chairman = newChairman;

    // Set Agenda
    if (setAgenda) {
      PoliticalAgendas.setNextAgenda(this, game);
    }

    // Finally, award Chairman benefits
    if (this.chairman !== 'NEUTRAL') {
      const chairman = this.chairman;
      // With Giga Turmoil the +1 TR is one of the options on the chairman wheel.
      const useWheel = this.gigaTurmoil && gainTR;
      let steps = gainTR && !useWheel ? 1 : 0;
      // Tempest Consultancy Hook (gains an additional TR when they become chairman)
      if (chairman.tableau.has(CardName.TEMPEST_CONSULTANCY)) {
        steps += 1;
      }

      if (useWheel) {
        chairman.defer(() => chairmanWheelInput(chairman));
      }
      // Raise TR
      chairman.defer(() => {
        if (steps > 0) {
          chairman.increaseTerraformRating(steps);
          game.log('${0} is the new chairman and gains ${1}:i:tr:', (b) => b.player(chairman).number(steps));
        } else if (!useWheel) {
          game.log('${0} is the new chairman', (b) => b.player(chairman));
        }
      });
    } else {
      game.log('A neutral delegate is the new chairman.');
    }
  }

  // Returns the second-most dominant party. Used for Mars Frontier Alliance
  private findSecondDominantParty(currentDominantParty: IParty): IParty | undefined {
    const currentIndex = this.parties.indexOf(currentDominantParty);

    let partiesToCheck: Array<IParty> = [];
    if (currentIndex === 0) {
      partiesToCheck = this.parties.slice(1);
    } else if (currentIndex === this.parties.length - 1) {
      partiesToCheck = this.parties.slice(0, -1);
    } else {
      partiesToCheck = [...this.parties.slice(currentIndex + 1), ...this.parties.slice(0, currentIndex)];
    }

    const sortParties = this.parties.toSorted(
      (p1, p2) => p2.delegates.size - p1.delegates.size,
    );
    const first = sortParties[0].delegates.size;

    const partiesOrdered = partiesToCheck.reverse();
    return partiesOrdered.find((p) => p.delegates.size === first);
  }

  // Called either directly during generation change, or after asking chairperson player
  // to choose an agenda.
  public onAgendaSelected(game: IGame): void {
    const rulingParty = this.rulingParty;

    // Ruling bonus should be chosen between global or allied party if MFA is in play
    const alliedPlayer = game.players.find((p) => p.alliedParty !== undefined);
    if (game.turmoil && alliedPlayer) {
      const currentDominantParty = game.turmoil.dominantParty;
      const secondDominantParty = this.findSecondDominantParty(currentDominantParty);

      if (secondDominantParty) {
        alliedPlayer.setAlliedParty(secondDominantParty);
      }
    }

    // Resolve Ruling Bonus
    const bonusId = PoliticalAgendas.currentAgenda(this).bonusId;
    const bonus = rulingParty.bonuses.find((b) => b.id === bonusId);
    if (bonus === undefined) {
      throw new Error(`Bonus id ${bonusId} not found in party ${rulingParty.name}`);
    }
    game.log('The ruling bonus is: ${0}', (b) => b.string(bonus.description));

    // Mars Frontier Alliance
    if (alliedPlayer?.alliedParty) {
      const alliedParty = this.parties.find((p) => p.name === alliedPlayer.alliedParty?.partyName);
      if (alliedParty) {
        const bonuses = [bonus, alliedParty.bonuses[0]];
        game.defer(new ChoosePolicyBonus(alliedPlayer, bonuses, (bonusId) => {
          const chosenBonus = this.parties.flatMap((p) => p.bonuses).find((b) => b.id === bonusId);
          chosenBonus?.grantForPlayer?.(alliedPlayer);
        }));
      }
    }
    bonus.grant(game);

    const policyId = PoliticalAgendas.currentAgenda(this).policyId;
    const policy = rulingParty.policies.find((p) => p.id === policyId);
    if (policy === undefined) {
      throw new Error(`Policy id ${policyId} not found in party ${rulingParty.name}`);
    }
    const description = policyDescription(policy, undefined);
    game.log('The ruling policy is: ${0}', (b) => b.string(description));
    policy.onPolicyStart?.(game);
  }

  public getInfluence(player: IPlayer) {
    let influence = 0;
    if (this.chairman === player) {
      influence++;
    }

    const dominantParty : IParty = this.dominantParty;
    const isPartyLeader = dominantParty.partyLeader === player;
    const delegateCount = dominantParty.delegates.get(player);

    if (isPartyLeader) {
      influence++;
      if (delegateCount > 1) {
        influence++;
      } // at least 1 non-leader delegate
    } else {
      if (delegateCount > 0) {
        influence++;
      }
    }

    if (this.playersInfluenceBonus.has(player.id)) {
      const bonus = this.playersInfluenceBonus.get(player.id);
      if (bonus) {
        influence+= bonus;
      }
    }

    for (const card of player.tableau) {
      influence += card.getInfluenceBonus?.(player) ?? 0;
    }

    return influence;
  }

  public addInfluenceBonus(player: IPlayer, bonus:number = 1) {
    if (this.playersInfluenceBonus.has(player.id)) {
      let current = this.playersInfluenceBonus.get(player.id);
      if (current) {
        current += bonus;
        this.playersInfluenceBonus.set(player.id, current);
      }
    } else {
      this.playersInfluenceBonus.set(player.id, bonus);
    }
  }

  /**
   * End-game victory points for `player`.
   *
   * Players get 1 VP at the end of the game for each chairman and party leader they have.
   */
  public getVictoryPoints(player: IPlayer): number {
    let victory = 0;
    if (this.chairman === player) {
      victory++;
    }
    this.parties.forEach((party) => {
      if (party.partyLeader === player) {
        victory++;
      }
    });
    return victory;
  }

  public getSendDelegateInput(player: IPlayer): SelectParty | undefined {
    if (this.delegateReserve.has(player)) {
      let sendDelegate;
      if (!this.usedFreeDelegateAction.has(player)) {
        sendDelegate = new SendDelegateToArea(player, 'Send a delegate in an area (from lobby)', {freeStandardAction: true});
      } else if (player.tableau.has(CardName.INCITE) && player.canAfford(3)) {
        sendDelegate = new SendDelegateToArea(player, 'Send a delegate in an area (3 M€)', {cost: 3});
      } else if (player.canAfford(5)) {
        sendDelegate = new SendDelegateToArea(player, 'Send a delegate in an area (5 M€)', {cost: 5});
      }
      if (sendDelegate) {
        return sendDelegate.execute();
      }
    }
    return undefined;
  }

  public serialize(): SerializedTurmoil {
    const result: SerializedTurmoil = {
      chairman: serializeDelegateOrUndefined(this.chairman),
      rulingParty: this.rulingParty.name,
      dominantParty: this.dominantParty.name,
      usedFreeDelegateAction: Array.from(this.usedFreeDelegateAction).map(toID),
      delegateReserve: Array.from(this.delegateReserve.values()).map(serializeDelegate),
      parties: this.parties.map((p) => {
        return {
          name: p.name,
          delegates: Array.from(p.delegates.values()).map(serializeDelegate),
          partyLeader: serializeDelegateOrUndefined(p.partyLeader),
        };
      }),
      playersInfluenceBonus: Array.from(this.playersInfluenceBonus.entries()),
      globalEventDealer: this.globalEventDealer.serialize(),
      distantGlobalEvent: this.distantGlobalEvent?.name,
      comingGlobalEvent: this.comingGlobalEvent?.name,
      politicalAgendasData: PoliticalAgendas.serialize(this.politicalAgendasData),
    };
    if (this.gigaTurmoil) {
      result.gigaTurmoil = true;
    }
    if (this.partyDraft !== undefined) {
      result.partyDraft = this.partyDraft;
    }
    if (this.currentGlobalEvent !== undefined) {
      result.currentGlobalEvent = this.currentGlobalEvent.name;
    }
    return result;
  }

  public static deserialize(d: SerializedTurmoil, players: ReadonlyArray<IPlayer>): Turmoil {
    const dealer = GlobalEventDealer.deserialize(d.globalEventDealer);
    const chairman = deserializeDelegateOrUndefined(d.chairman, players);
    // The parties in play are the ones that were serialized. A standard game has the six official parties.
    const turmoil = new Turmoil(d.rulingParty, chairman || 'NEUTRAL', d.dominantParty, dealer, d.parties.map((p) => p.name), d.gigaTurmoil === true);
    turmoil.partyDraft = d.partyDraft;

    turmoil.usedFreeDelegateAction = new Set(d.usedFreeDelegateAction.map((p) => deserializePlayerId(p, players)));

    turmoil.delegateReserve = MultiSet.from(d.delegateReserve.map((p) => deserializeDelegate(p, players)));

    if (d.lobby !== undefined) {
      turmoil.usedFreeDelegateAction.clear();
      const legacyLobby = new Set(d.lobby);
      for (const player of players) {
        if (legacyLobby.has(player.id)) {
          turmoil.delegateReserve.add(player);
        } else {
          turmoil.usedFreeDelegateAction.add(player);
        }
      }
    }

    turmoil.politicalAgendasData = PoliticalAgendas.deserialize(d.politicalAgendasData);

    d.parties.forEach((sp) => {
      const tp = turmoil.getPartyByName(sp.name);
      tp.delegates = MultiSet.from(sp.delegates.map((p) => deserializeDelegate(p, players)));
      tp.partyLeader = deserializeDelegateOrUndefined(sp.partyLeader, players);
    });

    turmoil.playersInfluenceBonus = new Map(d.playersInfluenceBonus);

    if (d.distantGlobalEvent) {
      turmoil.distantGlobalEvent = getGlobalEventByName(d.distantGlobalEvent);
    }
    if (d.comingGlobalEvent) {
      turmoil.comingGlobalEvent = getGlobalEventByName(d.comingGlobalEvent);
    }
    if (d.currentGlobalEvent) {
      turmoil.currentGlobalEvent = getGlobalEventByName(d.currentGlobalEvent);
    }

    return turmoil;
  }
}

function serializeDelegate(delegate: Delegate): SerializedDelegate {
  return delegate === 'NEUTRAL' ? 'NEUTRAL' : delegate.id;
}

function serializeDelegateOrUndefined(delegate: Delegate | undefined): SerializedDelegate | undefined {
  if (delegate === undefined) {
    return undefined;
  }
  return serializeDelegate(delegate);
}

function deserializePlayerId(playerId: PlayerId, players: ReadonlyArray<IPlayer>): IPlayer {
  const player = players.find((p) => p.id === playerId);
  if (player === undefined) {
    throw new Error('Delegate not found');
  }
  return player;
}

function deserializeDelegate(serializedDelegate: SerializedDelegate, players: ReadonlyArray<IPlayer>): Delegate {
  if (serializedDelegate === 'NEUTRAL') {
    return 'NEUTRAL';
  }
  return deserializePlayerId(serializedDelegate, players);
}

function deserializeDelegateOrUndefined(serializedDelegate: SerializedDelegate | undefined, players: ReadonlyArray<IPlayer>): Delegate | undefined {
  if (serializedDelegate === undefined) {
    return undefined;
  }
  return deserializeDelegate(serializedDelegate, players);
}
