// Copy of the Eternity smoke test's auto-responder, so importing it doesn't re-run that suite.
import {runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {PlayerInput} from '../../../src/server/PlayerInput';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {SelectPayment} from '../../../src/server/inputs/SelectPayment';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {AndOptions} from '../../../src/server/inputs/AndOptions';
import {SelectResource} from '../../../src/server/inputs/SelectResource';
import {SelectResources} from '../../../src/server/inputs/SelectResources';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';
import {SelectProductionToLose} from '../../../src/server/inputs/SelectProductionToLose';
import {Payment} from '../../../src/common/inputs/Payment';
import {Units} from '../../../src/common/Units';
import {Resource} from '../../../src/common/Resource';
import {SelectParty} from '../../../src/server/inputs/SelectParty';

/** Answers whatever the player is asked with the first sensible choice. */
export function autoRespond(game: IGame, player: TestPlayer, first?: PlayerInput | undefined, depth = 0): void {
  let input: PlayerInput | undefined = first;
  for (let i = 0; i < 60; i++) {
    if (input === undefined) {
      runAllActions(game);
      input = player.popWaitingFor();
      if (input === undefined) {
        // Opponents may be asked something too (e.g. Space Madness).
        for (const p of game.players) {
          const w = (p as TestPlayer).popWaitingFor();
          if (w !== undefined) {
            autoRespond(game, p as TestPlayer, w, depth + 1);
          }
        }
        runAllActions(game);
        input = player.popWaitingFor();
        if (input === undefined) {
          return;
        }
      }
    }
    input = answer(player, input);
  }
}

function answer(player: TestPlayer, input: PlayerInput): PlayerInput | undefined {
  if (input instanceof OrOptions) {
    return input.options[0].cb(undefined) ?? undefined;
  }
  if (input instanceof SelectOption) {
    return input.cb(undefined) ?? undefined;
  }
  if (input instanceof AndOptions) {
    input.options.forEach((o) => answer(player, o));
    return input.cb(undefined) ?? undefined;
  }
  if (input instanceof SelectCard) {
    const n = Math.max(input.config.min ?? 1, 0);
    return input.cb(input.cards.slice(0, n)) ?? undefined;
  }
  if (input instanceof SelectSpace) {
    return input.cb(input.spaces[0]) ?? undefined;
  }
  if (input instanceof SelectAmount) {
    return input.cb(input.min) ?? undefined;
  }
  if (input instanceof SelectColony) {
    return input.cb(input.colonies[0]) ?? undefined;
  }
  if (input instanceof SelectPlayer) {
    return input.cb(input.players[0]) ?? undefined;
  }
  if (input instanceof SelectPayment) {
    return input.cb(Payment.of({megacredits: input.amount})) ?? undefined;
  }
  if (input instanceof SelectResource) {
    return input.cb(Resource.MEGACREDITS as any) ?? undefined;
  }
  if (input instanceof SelectResources) {
    return input.cb(Units.of({megacredits: input.count})) ?? undefined;
  }
  if (input instanceof SelectProductionToLose) {
    return input.cb(Units.of({megacredits: input.unitsToLose})) ?? undefined;
  }
  if (input instanceof SelectProjectCardToPlay) {
    const card = input.cards[0];
    return input.cb(card, Payment.of({megacredits: player.getCardCost(card)})) ?? undefined;
  }
  if (input instanceof SelectStandardProjectToPlay) {
    return undefined;
  }
  if (input instanceof SelectParty) {
    return input.cb(input.parties[0]) ?? undefined;
  }
  throw new Error('Unhandled input ' + input.constructor.name);
}

