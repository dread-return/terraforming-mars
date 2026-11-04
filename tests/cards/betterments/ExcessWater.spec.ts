import {expect} from 'chai';
import {ExcessWater} from '../../../src/server/cards/betterments/ExcessWater';
import {testGame} from '../../TestGame';

describe('ExcessWater', () => {
  it('adds 2 M€ to the ocean adjacency bonus', () => {
    const card = new ExcessWater();
    const [/* game */, player] = testGame(2);
    expect(player.oceanBonus).eq(2);
    card.play(player);
    expect(player.oceanBonus).eq(4);
  });
});
