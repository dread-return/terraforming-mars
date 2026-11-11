import {IGame} from '../../IGame';
import {IPlayer} from '../../IPlayer';
import {PartyName, GIGA_PARTIES_IN_PLAY} from '../../../common/turmoil/PartyName';
import {PlayerId} from '../../../common/Types';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {message} from '../../logs/MessageBuilder';
import {inplaceShuffle} from '../../utils/shuffle';
import {toID} from '../../../common/utils/utils';
import {BOARD_ORDER, Turmoil} from '../Turmoil';

/**
 * The state of the Giga Turmoil party draft. It is saved with the game, so a game can be restored in the middle of it.
 */
export type PartyDraftState = {
  /** What each player is holding right now, in the order of `game.players`. */
  hands: Array<Array<PartyName>>;
  /** The parties that were chosen so far. */
  picked: Array<PartyName>;
  /** The players who still have to choose a party this round. */
  waiting: Array<PlayerId>;
};

/*
 * Giga Turmoil party draft.
 *
 * All twelve parties are dealt out equally between the players (any left over are set aside). Everybody chooses one
 * party and passes the rest to the next player, and this repeats until six parties are chosen. Like the card draft,
 * everybody chooses at the same time.
 *
 * When the last round needs fewer parties than there are players (four players need two rounds of four picks for six
 * parties, so only two choose in the second), the first players in turn order choose.
 */

/** The parties each of `playerCount` players is dealt. */
export function partiesPerPlayer(playerCount: number): number {
  return Math.floor(BOARD_ORDER.length / playerCount);
}

/** Deal the parties and ask the players to choose. `done` is called once six parties are in play. */
export function startPartyDraft(game: IGame, done: () => void): void {
  const turmoil = Turmoil.getTurmoil(game);
  const parties = [...BOARD_ORDER];
  inplaceShuffle(parties, game.rng);
  const each = partiesPerPlayer(game.players.length);
  turmoil.partyDraft = {
    hands: game.players.map((_, i) => parties.slice(i * each, (i + 1) * each)),
    picked: [],
    waiting: [],
  };
  runRound(game, done);
}

/** Called when a game is restored from the middle of the party draft. */
export function restorePartyDraft(game: IGame, done: () => void): void {
  const draft = Turmoil.getTurmoil(game).partyDraft;
  if (draft === undefined) {
    throw new Error('There is no party draft to restore');
  }
  if (draft.waiting.length === 0) {
    runRound(game, done);
    return;
  }
  for (const id of draft.waiting) {
    prompt(game, done, game.getPlayerById(id));
  }
}

function getDraft(game: IGame): PartyDraftState {
  const draft = Turmoil.getTurmoil(game).partyDraft;
  if (draft === undefined) {
    throw new Error('There is no party draft');
  }
  return draft;
}

function handOf(game: IGame, player: IPlayer): Array<PartyName> {
  return getDraft(game).hands[game.players.indexOf(player)];
}

/** Records the choice. Does not move on to the next round. */
function applyPick(game: IGame, player: IPlayer, name: PartyName): void {
  const draft = getDraft(game);
  const hand = handOf(game, player);
  const index = hand.indexOf(name);
  if (index === -1) {
    throw new Error(`${name} is not in the hand`);
  }
  hand.splice(index, 1);
  draft.picked.push(name);
  draft.waiting = draft.waiting.filter((id) => id !== player.id);
}

function runRound(game: IGame, done: () => void): void {
  const draft = getDraft(game);
  for (;;) {
    const needed = GIGA_PARTIES_IN_PLAY - draft.picked.length;
    if (needed <= 0) {
      Turmoil.getTurmoil(game).startGigaGovernment(game, draft.picked);
      done();
      return;
    }
    const pickers = game.players.slice(0, needed);
    draft.waiting = pickers.map(toID);

    // A player with a single party left has nothing to decide.
    for (const player of pickers) {
      const hand = handOf(game, player);
      if (hand.length === 1) {
        applyPick(game, player, hand[0]);
      }
    }
    if (draft.waiting.length > 0) {
      break;
    }
    passHands(draft);
  }
  for (const id of draft.waiting) {
    prompt(game, done, game.getPlayerById(id));
  }
  game.save();
}

/** Everybody passes what they still hold to the next player. */
function passHands(draft: PartyDraftState): void {
  const last = draft.hands.pop();
  if (last !== undefined) {
    draft.hands.unshift(last);
  }
}

function prompt(game: IGame, done: () => void, player: IPlayer): void {
  const next = game.getPlayerAfter(player);
  const options = handOf(game, player).map((name) => {
    return new SelectOption(name).andThen(() => {
      applyPick(game, player, name);
      const draft = getDraft(game);
      if (draft.waiting.length === 0) {
        passHands(draft);
        runRound(game, done);
      } else {
        game.save();
      }
      return undefined;
    });
  });
  const title = message('Choose a party to put into play and pass the rest to ${0}', (b) => b.player(next));
  player.setWaitingFor(new OrOptions(...options).setTitle(title));
}
