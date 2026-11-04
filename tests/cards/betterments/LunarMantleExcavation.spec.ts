import {expect} from 'chai';
import {LunarMantleExcavation} from '../../../src/server/cards/betterments/LunarMantleExcavation';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {cast} from '../../../src/common/utils/utils';

describe('LunarMantleExcavation', () => {
  it('requires a Moon tag', () => {
    const card = new LunarMantleExcavation();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.MOON]}));
    expect(card.canPlay(player)).is.true;
  });

  it('converts energy to steel', () => {
    const card = new LunarMantleExcavation();
    const [/* game */, player] = testGame(2);
    expect(card.canAct(player)).is.false;
    player.energy = 3;
    const selectAmount = cast(card.action(player), SelectAmount);
    selectAmount.cb(2);
    expect(player.energy).eq(1);
    expect(player.steel).eq(2);
  });
});
