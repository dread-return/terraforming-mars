import {expect} from 'chai';
import {SupernovaExplosion} from '../../../src/server/cards/robantilles/SupernovaExplosion';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';

describe('SupernovaExplosion', () => {
  it('raises temperature and grants energy and heat', () => {
    const card = new SupernovaExplosion();
    const [game, player] = testGame(2);
    card.play(player);
    runAllActions(game);
    expect(game.getTemperature()).eq(-28);
    expect(player.energy).eq(5);
    expect(player.heat).eq(5);
  });
});
