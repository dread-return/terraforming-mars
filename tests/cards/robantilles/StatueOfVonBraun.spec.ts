import {expect} from 'chai';
import {StatueOfVonBraun} from '../../../src/server/cards/robantilles/StatueOfVonBraun';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('StatueOfVonBraun', () => {
  it('scores 1 VP per 2 space tags', () => {
    const card = new StatueOfVonBraun();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.playedCards.push(fakeCard({tags: [Tag.SPACE, Tag.SPACE, Tag.SPACE]}));
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
