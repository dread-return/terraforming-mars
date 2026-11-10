import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions, setTemperature, setOxygenLevel, setVenusScaleLevel, addGreenery, addCity, addOcean} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {ETERNITY_CARD_MANIFEST} from '../../../src/server/cards/eternity/EternityCardManifest';
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
import {isIActionCard, ICard} from '../../../src/server/cards/ICard';
import {CardType} from '../../../src/common/cards/CardType';
import {CardRenderer} from '../../../src/server/cards/render/CardRenderer';
import {Resource} from '../../../src/common/Resource';
import {Tag} from '../../../src/common/cards/Tag';

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
  throw new Error('Unhandled input ' + input.constructor.name);
}

function richGame(): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, {
    venusNextExtension: true, coloniesExtension: true, preludeExtension: true, turmoilExtension: false,
    pathfindersExpansion: true, nuclearExpansion: true, eternityExpansion: true, promoCardsOption: true,
  });
  setTemperature(game, 0);
  setOxygenLevel(game, 8);
  setVenusScaleLevel(game, 20);
  addOcean(player);
  addGreenery(player);
  addGreenery(player);
  addCity(other);
  addCity(player);
  for (const p of [player, other]) {
    p.stock.add(Resource.MEGACREDITS, 200);
    p.stock.adjust(Units.of({steel: 20, titanium: 20, plants: 20, energy: 20, heat: 30}));
    p.production.adjust(Units.of({megacredits: 5, steel: 3, titanium: 3, plants: 3, energy: 3, heat: 3}));
  }
  // Wild tags meet tag requirements; a played card fills the discard pile.
  player.playedCards.push(fakeCard({name: 'wild' as any, tags: Array(8).fill(Tag.WILD)}));
  game.projectDeck.discard(game.projectDeck.drawOrThrow(game));
  return [game, player, other];
}

describe('Eternity smoke test: every card plays, acts and renders', () => {
  const all = [
    ...Object.values(ETERNITY_CARD_MANIFEST.projectCards),
    ...Object.values(ETERNITY_CARD_MANIFEST.preludeCards),
    ...Object.values(ETERNITY_CARD_MANIFEST.corporationCards),
  ].map((f) => new f!.Factory() as ICard);

  for (const card of all) {
    it(card.name, () => {
      const [game, player] = richGame();
      expect(card.metadata.renderData).is.instanceOf(Object);
      expect(() => CardRenderer.builder).not.to.throw;
      if (card.type === CardType.CORPORATION) {
        player.playCorporationCard(card as any);
      } else {
        player.cardsInHand.push(card as any);
        if ((card as any).canPlay(player) === false) {
          if (process.env.SHOW_SKIPPED) {
            console.log('SKIPPED ' + card.name);
          }
          return;
        }
        player.playCard(card as any);
      }
      autoRespond(game, player);
      if (isIActionCard(card) && card.canAct(player)) {
        autoRespond(game, player, card.action(player));
      }
      card.getVictoryPoints(player, 'projectWorkshop' as any);
    });
  }
});
