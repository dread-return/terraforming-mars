import {expect} from 'chai';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {IGame} from '../../src/server/IGame';
import {Game} from '../../src/server/Game';
import {addCity, addGreenery, runAllActions} from '../TestingUtils';
import {cast} from '../../src/common/utils/utils';
import {SelectCard} from '../../src/server/inputs/SelectCard';
import {Postludes} from '../../src/server/postludes/Postludes';
import {POSTLUDE_CARD_NAMES, HELD_OUT_POSTLUDES, isPostludeName, POSTLUDE_SELL_VALUE} from '../../src/common/postludes/Postludes';
import {CardName} from '../../src/common/cards/CardName';
import {SellPostludesStandardProject} from '../../src/server/cards/postludes/SellPostludesStandardProject';
import {SellPatentsStandardProject} from '../../src/server/cards/base/standardProjects/SellPatentsStandardProject';
import {MiningDepot} from '../../src/server/cards/postludes/MiningDepot';
import {Scientist} from '../../src/server/awards/Scientist';
import {Phase} from '../../src/common/Phase';
import {Resource} from '../../src/common/Resource';
import {InsuranceHQ} from '../../src/server/cards/postludes/InsuranceHQ';
import {DeepSeaMiningRig as MiningRig} from '../../src/server/cards/postludes/DeepSeaMiningRig';

describe('Postludes', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {postludesExpansion: true, individualTracks: true});
  });

  it('is off by default', () => {
    const [offGame] = testGame(2);
    expect(offGame.postludes).is.undefined;
  });

  it('turns on its own deck, without the held-out cards', () => {
    const deck = game.postludes!.deck;
    expect(deck.drawPile.length + deck.discardPile.length).eq(POSTLUDE_CARD_NAMES.length - HELD_OUT_POSTLUDES.size);
    for (const card of deck.drawPile) {
      expect(isPostludeName(card.name)).is.true;
    }
    expect(game.projectDeck.drawPile.some((card) => isPostludeName(card.name))).is.false;
  });

  it('gives each postlude source one cube per two players, with the odd ones going to a random half', () => {
    for (const count of Object.values(game.postludes!.cubes)) {
      expect(count).eq(1);
    }
    const [game3] = testGame(3, {postludesExpansion: true, individualTracks: true});
    const counts = Object.values(game3.postludes!.cubes);
    expect(counts.filter((c) => c === 2)).has.length(4);
    expect(counts.filter((c) => c === 1)).has.length(3);
  });

  describe('gaining', () => {
    it('draws four, keeps one, and discards the rest to the postlude discard pile', () => {
      Postludes.gain(player, 'oxygen');
      runAllActions(game);
      const input = cast(player.popWaitingFor(), SelectCard);
      expect(input.cards).has.length(4);
      const [keep, ...rest] = input.cards;
      input.cb([keep]);
      expect(player.cardsInHand).deep.eq([keep]);
      expect(game.postludes!.deck.discardPile).to.include.members(rest);
      expect(game.postludes!.cubes.oxygen).eq(0);
    });

    it('stops when a source has no cubes left', () => {
      Postludes.gain(player, 'oxygen');
      Postludes.gain(player2, 'oxygen');
      runAllActions(game);
      expect(player.popWaitingFor()).is.not.undefined;
      expect(player2.popWaitingFor()).is.undefined;
    });

    it('the first player to reach 25 TR and the first to reach 35 TR each get one', () => {
      player.setTerraformRating(24);
      player2.setTerraformRating(24);
      player.increaseTerraformRating();
      runAllActions(game);
      expect(player.popWaitingFor()).is.not.undefined;
      // Reaching 25 later is too late, and it is not given twice.
      player.increaseTerraformRating();
      player2.increaseTerraformRating();
      runAllActions(game);
      expect(player.popWaitingFor()).is.undefined;
      expect(player2.popWaitingFor()).is.undefined;
      expect(game.postludes!.cubes.tr25).eq(0);
      expect(game.postludes!.claimed.tr25[0]).eq(player.id);
    });

    it('funding an award gives a postlude', () => {
      Postludes.onAwardFunded(player);
      runAllActions(game);
      expect(player.popWaitingFor()).is.not.undefined;
    });

    it('funding an award uses no cubes', () => {
      const before = {...game.postludes!.cubes};
      Postludes.onAwardFunded(player);
      Postludes.onAwardFunded(player2);
      expect(game.postludes!.cubes).deep.eq(before);
    });

    it('funding the real award gives a postlude', () => {
      player.megaCredits = 20;
      game.fundAward(player, new Scientist());
      runAllActions(game);
      expect(player.popWaitingFor()).is.not.undefined;
    });

    it('at the start of generation 7, players get the postludes in turn order, as long as cubes last', () => {
      game.generation = 7;
      Postludes.onGenerationStart(game);
      runAllActions(game);
      expect(game.postludes!.cubes.generation7).eq(0);
      const first = game.playersInGenerationOrder[0] as TestPlayer;
      const second = game.playersInGenerationOrder[1] as TestPlayer;
      expect(first.popWaitingFor()).is.not.undefined;
      expect(second.popWaitingFor()).is.undefined;
    });

    it('does nothing in other generations', () => {
      game.generation = 6;
      Postludes.onGenerationStart(game);
      runAllActions(game);
      expect(game.postludes!.cubes.generation7).eq(1);
    });

    it('works from the individual tracks, at step 3', () => {
      game.phase = Phase.ACTION;
      game.increaseOxygenLevel(player, 2);
      game.increaseOxygenLevel(player, 1);
      runAllActions(game);
      expect(player.popWaitingFor()).is.not.undefined;
      expect(game.postludes!.cubes.oxygen).eq(0);
    });
  });

  describe('selling', () => {
    it('Sell Postludes gives 3 M€ for each postlude', () => {
      const card = new SellPostludesStandardProject();
      const [a, b] = game.postludes!.deck.drawN(game, 2);
      player.cardsInHand.push(a, b);
      expect(card.canAct(player)).is.true;
      player.megaCredits = 0;
      const input = cast(card.action(player), SelectCard);
      input.cb([a, b]);
      expect(player.megaCredits).eq(2 * POSTLUDE_SELL_VALUE);
      expect(player.cardsInHand).is.empty;
      expect(game.postludes!.deck.discardPile).to.include.members([a, b]);
    });

    it('Sell Postludes needs a postlude', () => {
      expect(new SellPostludesStandardProject().canAct(player)).is.false;
    });

    it('Sell Patents cannot sell postludes', () => {
      const [a] = game.postludes!.deck.drawN(game, 1);
      player.cardsInHand.push(a);
      expect(new SellPatentsStandardProject().canAct(player)).is.false;
    });
  });

  describe('placing', () => {
    it('needs an own city for a city postlude', () => {
      const card = new MiningDepot();
      player.megaCredits = 100;
      expect(card.canPlay(player)).is.false;
      addCity(player2);
      expect(card.canPlay(player)).is.false;
      addCity(player);
      expect(card.canPlay(player)).is.true;
    });

    it('goes on top of the tile, which stays what it was', () => {
      const space = addCity(player);
      const card = new MiningDepot();
      player.playedCards.push(card);
      Postludes.place(player, card, space);
      expect(space.tile?.postlude).eq(CardName.MINING_DEPOT);
      expect(space.tile?.tileType).is.not.undefined;
      expect(Postludes.spaceOf(game, CardName.MINING_DEPOT)).eq(space);
    });

    it('a tile holds one postlude only', () => {
      const space = addCity(player);
      Postludes.place(player, new MiningDepot(), space);
      expect(Postludes.spacesFor(player, 'city')).does.not.include(space);
    });

    it('greenery postludes need an own greenery', () => {
      const space = addGreenery(player);
      expect(Postludes.spacesFor(player, 'greenery')).deep.eq([space]);
      expect(Postludes.spacesFor(player2, 'greenery')).is.empty;
    });

    it('ocean postludes need the ocean track to be ahead of the postludes owned', () => {
      expect(Postludes.canPlaceOcean(player)).is.false;
      player.individualTracksData!.positions.oceans = 1;
      expect(Postludes.canPlaceOcean(player)).is.true;
      player.playedCards.push(new MiningRig());
      expect(Postludes.canPlaceOcean(player)).is.false;
    });
  });

  describe('effects', () => {
    it('Insurance HQ pays back as many as it has adjacent tiles, when something takes from you', () => {
      const city = addCity(player);
      const hq = new InsuranceHQ();
      player.playedCards.push(hq);
      Postludes.place(player, hq, city);
      for (const space of game.board.getAdjacentSpaces(city).slice(0, 2)) {
        game.simpleAddTile(player2, space, {tileType: 2 as any});
      }
      player.steel = 5;
      player.stock.add(Resource.STEEL, -1, {from: {player: player2}});
      expect(player.steel).eq(6);
    });

    it('Insurance HQ does nothing for spending', () => {
      const city = addCity(player);
      const hq = new InsuranceHQ();
      player.playedCards.push(hq);
      Postludes.place(player, hq, city);
      player.steel = 5;
      player.stock.add(Resource.STEEL, -1);
      expect(player.steel).eq(4);
    });
  });

  describe('serialization', () => {
    it('keeps the deck, the cubes and where the postludes are', () => {
      const space = addCity(player);
      Postludes.place(player, new MiningDepot(), space);
      Postludes.gain(player, 'temperature');
      runAllActions(game);
      const serialized = game.serialize();
      const restored = Game.deserialize(serialized);
      expect(restored.postludes!.cubes).deep.eq(game.postludes!.cubes);
      expect(restored.postludes!.deck.drawPile.map((c) => c.name)).deep.eq(game.postludes!.deck.drawPile.map((c) => c.name));
      expect(restored.board.getSpaceOrThrow(space.id).tile?.postlude).eq(CardName.MINING_DEPOT);
    });
  });
});
