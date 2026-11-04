import {expect} from 'chai';
import {GreatLighthouseOfAlbaPatera} from '../../../src/server/cards/robantilles/GreatLighthouseOfAlbaPatera';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('GreatLighthouseOfAlbaPatera', () => {
  it('scores 1 VP per 2 power tags', () => {
    const card = new GreatLighthouseOfAlbaPatera();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.POWER, Tag.POWER]}));
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
