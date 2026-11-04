import {expect} from 'chai';
import {ObservatoryOnOlympusMons} from '../../../src/server/cards/robantilles/ObservatoryOnOlympusMons';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('ObservatoryOnOlympusMons', () => {
  it('draws a card per 2 space tags', () => {
    const card = new ObservatoryOnOlympusMons();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SPACE, Tag.SPACE, Tag.SPACE, Tag.SPACE, Tag.SPACE]}));
    card.play(player);
    expect(player.cardsInHand).has.length(2);
  });
});
