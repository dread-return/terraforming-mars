import {expect} from 'chai';
import {VenusEarthPartnership} from '../../../src/server/cards/betterments/VenusEarthPartnership';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('VenusEarthPartnership', () => {
  it('requires 3 Earth and 3 Venus tags', () => {
    const card = new VenusEarthPartnership();
    const [/* game */, player] = testGame(2, {venusNextExtension: true});
    player.playedCards.push(fakeCard({tags: [Tag.EARTH, Tag.EARTH, Tag.EARTH, Tag.VENUS, Tag.VENUS]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.VENUS]}));
    expect(card.canPlay(player)).is.true;
    expect(card.getVictoryPoints(player)).eq(5);
  });
});
