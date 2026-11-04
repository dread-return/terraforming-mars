import {expect} from 'chai';
import {Cacti} from '../../../src/server/cards/robantilles/Cacti';
import {testGame} from '../../TestGame';
import {setTemperature} from '../../TestingUtils';

describe('Cacti', () => {
  it('requires +8 °C and raises plant production', () => {
    const card = new Cacti();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    setTemperature(game, 8);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.plants).eq(1);
  });
});
