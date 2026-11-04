import {expect} from 'chai';
import {MuskAwards} from '../../../src/server/cards/robantilles/MuskAwards';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('MuskAwards', () => {
  it('pays M€ production and VP for science tags', () => {
    const card = new MuskAwards();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
    card.play(player);
    expect(player.production.megacredits).eq(3);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
