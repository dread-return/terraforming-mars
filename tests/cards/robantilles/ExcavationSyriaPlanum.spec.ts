import {expect} from 'chai';
import {ExcavationSyriaPlanum} from '../../../src/server/cards/robantilles/ExcavationSyriaPlanum';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {GreatFaceOfCydonia} from '../../../src/server/cards/robantilles/GreatFaceOfCydonia';

describe('ExcavationSyriaPlanum', () => {
  it('reduces the next card\'s science requirement by 2', () => {
    const card = new ExcavationSyriaPlanum();
    const cydonia = new GreatFaceOfCydonia();
    const [/* game */, player] = testGame(2);
    player.megaCredits = 100;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(cydonia.canPlay(player)).is.false;
    player.playCard(card);
    expect(cydonia.canPlay(player)).is.true;
  });
});
