import {expect} from 'chai';
import {ORCTurbines} from '../../../src/server/cards/robantilles/ORCTurbines';
import {FuelFactory} from '../../../src/server/cards/base/FuelFactory';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';

describe('ORC Turbines and cards that lower energy production', () => {
  it('lets you play a card that needs energy production by lowering heat production instead', () => {
    const fuelFactory = new FuelFactory(); // -1 energy production
    const [game, player] = testGame(2);
    player.megaCredits = 20;
    player.production.override({heat: 2});
    expect(fuelFactory.canPlay(player)).is.false;
    player.playedCards.push(new ORCTurbines());
    expect(fuelFactory.canPlay(player)).is.true;
    player.playCard(fuelFactory);
    runAllActions(game);
    expect(player.production.energy).eq(0);
    expect(player.production.heat).eq(0);
    expect(player.production.titanium).eq(1);
  });
});
