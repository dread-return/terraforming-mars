import {expect} from 'chai';
import {LaunchOfThePhoenix} from '../../../src/server/cards/robantilles/LaunchOfThePhoenix';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('LaunchOfThePhoenix', () => {
  it('requires 7 science tags and is worth 5 VP', () => {
    const card = new LaunchOfThePhoenix();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    expect(card.getVictoryPoints(player)).eq(5);
  });
});
