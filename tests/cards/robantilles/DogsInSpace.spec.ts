import {expect} from 'chai';
import {DogsInSpace} from '../../../src/server/cards/robantilles/DogsInSpace';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('DogsInSpace', () => {
  it('adds an animal for each space tag played, including itself', () => {
    const card = new DogsInSpace();
    const [/* game */, player] = testGame(2);
    player.playCard(card);
    expect(card.resourceCount).eq(1);
    player.playCard(fakeCard({tags: [Tag.SPACE]}));
    expect(card.resourceCount).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
