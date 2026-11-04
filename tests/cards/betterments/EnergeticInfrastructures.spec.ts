import {expect} from 'chai';
import {EnergeticInfrastructures} from '../../../src/server/cards/betterments/EnergeticInfrastructures';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('EnergeticInfrastructures', () => {
  it('pays out per tag, including this one', () => {
    const card = new EnergeticInfrastructures();
    const [/* game */, player, player2] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.POWER]}));
    player2.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.POWER, Tag.POWER]}));
    card.play(player);
    expect(player.megaCredits).eq(5 * 2);
    expect(player2.megaCredits).eq(2 * 3);
  });
});
