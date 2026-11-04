import {expect} from 'chai';
import {WeatherControl} from '../../../src/server/cards/betterments/WeatherControl';
import {testGame} from '../../TestGame';
import {addCity, addGreenery} from '../../TestingUtils';

describe('WeatherControl', () => {
  it('pays per tile on Mars', () => {
    const card = new WeatherControl();
    const [/* game */, player, player2] = testGame(2);
    addCity(player);
    addGreenery(player);
    addCity(player2);
    player.megaCredits = 0;
    player2.megaCredits = 0;
    card.play(player);
    expect(player.megaCredits).eq(4);
    expect(player2.megaCredits).eq(1);
  });
});
