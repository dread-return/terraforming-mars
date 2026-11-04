import {expect} from 'chai';
import {NukeAnAsteroid} from '../../../src/server/cards/betterments/NukeAnAsteroid';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {cast} from '../../../src/common/utils/utils';

describe('NukeAnAsteroid', () => {
  it('raises titanium production and splits 5 titanium among opponents', () => {
    const card = new NukeAnAsteroid();
    const [game, player, player2, player3] = testGame(3);
    card.play(player);
    expect(player.production.titanium).eq(2);
    runAllActions(game);
    const selectAmount = cast(player.popWaitingFor(), SelectAmount);
    selectAmount.cb(2);
    runAllActions(game);
    expect(player2.titanium).eq(2);
    expect(player3.titanium).eq(3);
    expect(player.titanium).eq(0);
  });

  it('gives all 5 to the only opponent', () => {
    const card = new NukeAnAsteroid();
    const [/* game */, player, player2] = testGame(2);
    card.play(player);
    expect(player2.titanium).eq(5);
  });
});
