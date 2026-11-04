import {expect} from 'chai';
import {LightningAccumulators} from '../../../src/server/cards/robantilles/LightningAccumulators';
import {testGame} from '../../TestGame';

describe('LightningAccumulators', () => {
  it('raises energy production 3 steps', () => {
    const card = new LightningAccumulators();
    const [/* game */, player] = testGame(2);
    card.play(player);
    expect(player.production.energy).eq(3);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
