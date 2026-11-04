import {expect} from 'chai';
import {BiomassReactor} from '../../../src/server/cards/betterments/BiomassReactor';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('BiomassReactor', () => {
  it('requires 2 plant tags and raises energy production', () => {
    const card = new BiomassReactor();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.PLANT]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.PLANT]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.energy).eq(4);
  });

  it('converts energy production into plant production', () => {
    const card = new BiomassReactor();
    const [/* game */, player] = testGame(2);
    expect(card.canAct(player)).is.false;
    player.production.override({energy: 1});
    expect(card.canAct(player)).is.true;
    card.action(player);
    expect(player.production.energy).eq(0);
    expect(player.production.plants).eq(1);
  });
});
