import {expect} from 'chai';
import {AitkenDrillingOperations} from '../../../src/server/cards/betterments/AitkenDrillingOperations';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {cast} from '../../../src/common/utils/utils';

describe('AitkenDrillingOperations', () => {
  it('requires 5 science tags', () => {
    const card = new AitkenDrillingOperations();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.steel).eq(3);
  });

  it('converts steel to titanium', () => {
    const card = new AitkenDrillingOperations();
    const [/* game */, player] = testGame(2);
    expect(card.canAct(player)).is.false;
    player.steel = 4;
    const selectAmount = cast(card.action(player), SelectAmount);
    selectAmount.cb(4);
    expect(player.steel).eq(0);
    expect(player.titanium).eq(4);
  });
});
