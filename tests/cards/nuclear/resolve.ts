import {runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {PlayerInput} from '../../../src/server/PlayerInput';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {AndOptions} from '../../../src/server/inputs/AndOptions';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {SelectProductionToLose} from '../../../src/server/inputs/SelectProductionToLose';

export type Picks = {or?: Array<number>, card?: (cards: ReadonlyArray<{name: string}>) => number, player?: TestPlayer};

function answer(player: TestPlayer, input: PlayerInput, picks: Picks): PlayerInput | undefined {
  if (input instanceof OrOptions) {
    const option = input.options[picks.or?.shift() ?? 0];
    if (option instanceof SelectOption) {
      return option.cb(undefined);
    }
    return answer(player, option, picks);
  }
  if (input instanceof SelectOption) {
    return input.cb(undefined);
  }
  if (input instanceof SelectSpace) {
    return input.cb(input.spaces[0]);
  }
  if (input instanceof SelectProjectCardToPlay) {
    return undefined;
  }
  if (input instanceof SelectCard) {
    const idx = picks.card?.(input.cards) ?? 0;
    return input.cb([input.cards[idx]]);
  }
  if (input instanceof SelectPlayer) {
    const target = picks.player !== undefined && input.players.includes(picks.player) ? picks.player : input.players[0];
    return input.cb(target);
  }
  if (input instanceof SelectAmount) {
    return input.cb(input.max);
  }
  if (input instanceof AndOptions) {
    for (const option of input.options) {
      answer(player, option, picks);
    }
    return input.cb(undefined);
  }
  if (input instanceof SelectProductionToLose) {
    throw new Error('SelectProductionToLose not handled');
  }
  throw new Error('Unhandled input ' + input.constructor.name);
}

/** Runs deferred actions and answers every input the player (and their opponents) are asked, picking the first choice. */
export function resolve(player: TestPlayer, picks: Picks = {}): void {
  const game = player.game;
  for (let guard = 0; guard < 30; guard++) {
    runAllActions(game);
    let handled = false;
    for (const p of game.players as ReadonlyArray<TestPlayer>) {
      const input = p.popWaitingFor();
      if (input !== undefined) {
        const next = answer(p, input, picks);
        if (next !== undefined) {
          p.defer(next);
        }
        handled = true;
        break;
      }
    }
    if (!handled) {
      return;
    }
  }
  throw new Error('Too many inputs');
}
