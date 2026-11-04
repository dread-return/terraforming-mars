import {expect} from 'chai';
import {SMESTechnology} from '../../../src/server/cards/robantilles/SMESTechnology';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';

describe('SMESTechnology', () => {
  it('lets you keep up to 3 energy during production', () => {
    const card = new SMESTechnology();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    player.energy = 5;
    player.runProductionPhase();
    runAllActions(game);
    const selectAmount = cast(player.popWaitingFor(), SelectAmount);
    expect(selectAmount.min).eq(2);
    selectAmount.cb(2);
    expect(player.energy).eq(3);
    expect(player.heat).eq(2);
  });

  it('converts everything when there is nothing to keep', () => {
    const card = new SMESTechnology();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.energy = 0;
    player.runProductionPhase();
    expect(player.popWaitingFor()).is.undefined;
  });
});
