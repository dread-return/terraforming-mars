import {expect} from 'chai';
import {AdvancedSchools} from '../../../src/server/cards/betterments/AdvancedSchools';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('AdvancedSchools', () => {
  it('pays out per tag, including this one', () => {
    const card = new AdvancedSchools();
    const [/* game */, player, player2] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    player2.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
    card.play(player);
    expect(player.megaCredits).eq(3 * 2);
    expect(player2.megaCredits).eq(1 * 3);
  });
});
