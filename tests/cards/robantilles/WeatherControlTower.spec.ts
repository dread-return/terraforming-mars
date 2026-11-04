import {expect} from 'chai';
import {WeatherControlTower} from '../../../src/server/cards/robantilles/WeatherControlTower';
import {testGame} from '../../TestGame';
import {addGreenery, setOxygenLevel} from '../../TestingUtils';

describe('WeatherControlTower', () => {
  it('requires 6% oxygen and pays 2 M€ for any greenery', () => {
    const card = new WeatherControlTower();
    const [game, player, player2] = testGame(2);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 6);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    addGreenery(player2);
    expect(player.megaCredits).eq(2);
  });
});
