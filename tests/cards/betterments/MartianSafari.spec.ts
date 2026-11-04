import {expect} from 'chai';
import {MartianSafari} from '../../../src/server/cards/betterments/MartianSafari';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('MartianSafari', () => {
  it('requires an animal tag', () => {
    const card = new MartianSafari();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.ANIMAL]}));
    expect(card.canPlay(player)).is.true;
  });

  it('gains M€ production when any player plays an animal tag, including itself', () => {
    const card = new MartianSafari();
    const [/* game */, player, player2] = testGame(2);
    player.playCard(card);
    expect(player.production.megacredits).eq(1);
    player2.playCard(fakeCard({tags: [Tag.ANIMAL, Tag.ANIMAL]}));
    expect(player.production.megacredits).eq(3);
    player2.playCard(fakeCard({tags: [Tag.PLANT]}));
    expect(player.production.megacredits).eq(3);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
