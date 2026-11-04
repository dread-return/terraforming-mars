import {expect} from 'chai';
import {Bioreactors} from '../../../src/server/cards/robantilles/Bioreactors';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Tag} from '../../../src/common/cards/Tag';

describe('Bioreactors', () => {
  it('requires 2 science tags and adds an extra microbe', () => {
    const card = new Bioreactors();
    const tardigrades = new Tardigrades();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card, tardigrades);
    player.addResourceTo(tardigrades, 1);
    expect(tardigrades.resourceCount).eq(2);
  });
});
