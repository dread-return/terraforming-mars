import {expect} from 'chai';
import {FuturisticCentre} from '../../../src/server/cards/betterments/FuturisticCentre';
import {testGame} from '../../TestGame';

describe('FuturisticCentre', () => {
  it('lowers the research card cost by 1', () => {
    const card = new FuturisticCentre();
    const [/* game */, player] = testGame(2);
    expect(player.cardCost).eq(3);
    card.play(player);
    expect(player.cardCost).eq(2);
  });
});
