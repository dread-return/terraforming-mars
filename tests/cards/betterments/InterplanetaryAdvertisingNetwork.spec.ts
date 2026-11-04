import {expect} from 'chai';
import {InterplanetaryAdvertisingNetwork} from '../../../src/server/cards/betterments/InterplanetaryAdvertisingNetwork';
import {testGame} from '../../TestGame';
import {addCity, runAllActions} from '../../TestingUtils';

describe('InterplanetaryAdvertisingNetwork', () => {
  it('raises TR for each city you own on Mars', () => {
    const card = new InterplanetaryAdvertisingNetwork();
    const [game, player, player2] = testGame(2);
    addCity(player);
    addCity(player);
    addCity(player2);
    const tr = player.terraformRating;
    card.play(player);
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 2);
  });
});
