import {expect} from 'chai';
import {PlanetaryMuseum} from '../../../src/server/cards/robantilles/PlanetaryMuseum';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('PlanetaryMuseum', () => {
  it('raises M€ production per different tag, including this', () => {
    const card = new PlanetaryMuseum();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.EARTH, Tag.EARTH]}));
    card.play(player);
    expect(player.production.megacredits).eq(3);
  });
});
