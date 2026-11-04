import {expect} from 'chai';
import {VenusianEcology} from '../../../src/server/cards/betterments/VenusianEcology';
import {testGame} from '../../TestGame';
import {runAllActions, setVenusScaleLevel} from '../../TestingUtils';

describe('VenusianEcology', () => {
  it('spends 3 plants to raise Venus', () => {
    const card = new VenusianEcology();
    const [game, player] = testGame(2, {venusNextExtension: true});
    setVenusScaleLevel(game, 12);
    expect(card.canPlay(player)).is.true;
    player.plants = 3;
    card.action(player);
    runAllActions(game);
    expect(player.plants).eq(0);
    expect(game.getVenusScaleLevel()).eq(14);
  });
});
