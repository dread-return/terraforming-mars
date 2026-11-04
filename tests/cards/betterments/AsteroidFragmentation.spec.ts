import {expect} from 'chai';
import {AsteroidFragmentation} from '../../../src/server/cards/betterments/AsteroidFragmentation';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';

describe('AsteroidFragmentation', () => {
  it('spends heat, steel and titanium to raise TR 3 steps', () => {
    const card = new AsteroidFragmentation();
    const [game, player] = testGame(2);
    player.heat = 6;
    player.steel = 3;
    player.titanium = 2;
    expect(card.canPlay(player)).is.false;
    player.titanium = 3;
    expect(card.canPlay(player)).is.true;
    const tr = player.terraformRating;
    card.play(player);
    runAllActions(game);
    expect(player.heat).eq(0);
    expect(player.steel).eq(0);
    expect(player.titanium).eq(0);
    expect(player.terraformRating).eq(tr + 3);
  });
});
