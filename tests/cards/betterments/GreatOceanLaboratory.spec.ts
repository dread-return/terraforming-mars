import {expect} from 'chai';
import {GreatOceanLaboratory} from '../../../src/server/cards/betterments/GreatOceanLaboratory';
import {testGame} from '../../TestGame';
import {fakeCard, maxOutOceans} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('GreatOceanLaboratory', () => {
  it('requires 5 oceans', () => {
    const card = new GreatOceanLaboratory();
    const [/* game */, player] = testGame(2);
    maxOutOceans(player, 4);
    expect(card.canPlay(player)).is.false;
    maxOutOceans(player, 5);
    expect(card.canPlay(player)).is.true;
  });

  it('gains M€ production when any player plays a microbe tag, including itself', () => {
    const card = new GreatOceanLaboratory();
    const [/* game */, player, player2] = testGame(2);
    player.playCard(card);
    expect(player.production.megacredits).eq(1);
    player2.playCard(fakeCard({tags: [Tag.MICROBE]}));
    expect(player.production.megacredits).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
