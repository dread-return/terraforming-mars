import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectParty} from '../../../src/server/inputs/SelectParty';
import {fakeCard} from '../../TestingUtils';
import {CardType} from '../../../src/common/cards/CardType';
import {NewFrontier} from '../../../src/server/cards/idesofmars/NewFrontier';
import {ColonyScrapping} from '../../../src/server/cards/idesofmars/ColonyScrapping';
import {SpacePirates} from '../../../src/server/cards/idesofmars/SpacePirates';
import {MartianStockExchange} from '../../../src/server/cards/idesofmars/MartianStockExchange';
import {GalaxyExpress} from '../../../src/server/cards/idesofmars/GalaxyExpress';
import {SolarSenate} from '../../../src/server/cards/idesofmars/SolarSenate';

describe('Ides of Mars colony cards', () => {
  it('New Frontier: every tile colonized, then add a tile with your colony', () => {
    const card = new NewFrontier();
    const [game, player] = testGame(2, {coloniesExtension: true});
    expect(card.canPlay(player)).is.false;
    for (const colony of game.colonies) {
      colony.colonies.push(player.id);
    }
    expect(card.canPlay(player)).is.true;
    const tiles = game.colonies.length;
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectColony);
    const added = select.colonies[0];
    select.cb(added);
    runAllActions(game);
    expect(game.colonies).has.length(tiles + 1);
    expect(added.colonies).includes(player.id);
  });

  it('Colony Scrapping: remove a colony for 12 M€', () => {
    const card = new ColonyScrapping();
    const [game, player] = testGame(2, {coloniesExtension: true});
    expect(card.canPlay(player)).is.false;
    const colony = game.colonies[0];
    colony.colonies.push(player.id);
    expect(card.canPlay(player)).is.true;
    cast(card.play(player), SelectColony).cb(colony);
    expect(colony.colonies).is.empty;
    expect(player.megaCredits).eq(12);
  });

  it('Space Pirates: trade without a trade fleet, collecting every colony bonus', () => {
    const card = new SpacePirates();
    const [game, player, opponent] = testGame(2, {coloniesExtension: true});
    const colony = game.colonies[0];
    colony.colonies.push(opponent.id, opponent.id);
    cast(card.play(player), SelectColony).cb(colony);
    runAllActions(game);
    expect(player.colonies.usedTradeFleets).eq(0);
    expect(colony.visitor).eq(player.id);
    expect(card.canPlay(player)).is.true;
  });

  it('Martian Stock Exchange: move a colony track when any event is played', () => {
    const card = new MartianStockExchange();
    const [game, player, opponent] = testGame(2, {coloniesExtension: true});
    player.playedCards.push(card);
    card.onCardPlayedByAnyPlayer(player, fakeCard({type: CardType.AUTOMATED}));
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;
    card.onCardPlayedByAnyPlayer(player, fakeCard({type: CardType.EVENT}));
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    const colony = game.colonies[0];
    const track = colony.trackPosition;
    cast(options.options[0], SelectColony).cb(colony);
    expect(colony.trackPosition).eq(track + 1);
    void opponent;
  });

  it('Galaxy Express: M€ production per opponent colony', () => {
    const card = new GalaxyExpress();
    const [game, player, opponent] = testGame(2, {coloniesExtension: true});
    game.colonies[0].colonies.push(opponent.id, player.id);
    game.colonies[1].colonies.push(opponent.id);
    card.play(player);
    expect(player.production.megacredits).eq(2);
  });

  it('Solar Senate: every player with a colony adds a delegate', () => {
    const card = new SolarSenate();
    const [game, player, opponent] = testGame(2, {coloniesExtension: true, turmoilExtension: true});
    game.colonies[0].colonies.push(opponent.id);
    card.play(player);
    runAllActions(game);
    expect(player.production.megacredits).eq(1);
    cast(opponent.popWaitingFor(), SelectParty);
    expect(player.popWaitingFor()).is.undefined;
  });
});
