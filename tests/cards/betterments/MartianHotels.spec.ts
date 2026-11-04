import {expect} from 'chai';
import {MartianHotels} from '../../../src/server/cards/betterments/MartianHotels';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('MartianHotels', () => {
  it('pays 5 M€ per pair of building tags, including this one', () => {
    const card = new MartianHotels();
    const [/* game */, player, player2] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.BUILDING, Tag.BUILDING]}));
    player2.playedCards.push(fakeCard({tags: [Tag.BUILDING, Tag.BUILDING]}));
    card.play(player);
    // 2 + this = 3 building tags = 1 pair.
    expect(player.megaCredits).eq(5);
    expect(player2.megaCredits).eq(2);
  });
});
