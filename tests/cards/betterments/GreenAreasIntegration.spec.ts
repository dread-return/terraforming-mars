import {expect} from 'chai';
import {GreenAreasIntegration} from '../../../src/server/cards/betterments/GreenAreasIntegration';
import {testGame} from '../../TestGame';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {cast} from '../../../src/common/utils/utils';

describe('GreenAreasIntegration', () => {
  it('converts plants to TR, up to 5 times', () => {
    const card = new GreenAreasIntegration();
    const [/* game */, player] = testGame(2);
    player.plants = 20;
    const selectAmount = cast(card.play(player), SelectAmount);
    expect(selectAmount.max).eq(5);
    const tr = player.terraformRating;
    selectAmount.cb(4);
    expect(player.plants).eq(8);
    expect(player.terraformRating).eq(tr + 4);
  });
});
