import {expect} from 'chai';
import {UnderwaterOutpost} from '../../../src/server/cards/betterments/UnderwaterOutpost';
import {testGame} from '../../TestGame';
import {maxOutOceans, runAllActions} from '../../TestingUtils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '../../../src/common/utils/utils';

describe('UnderwaterOutpost', () => {
  it('requires 2 oceans', () => {
    const card = new UnderwaterOutpost();
    const [/* game */, player] = testGame(2);
    maxOutOceans(player, 1);
    expect(card.canPlay(player)).is.false;
    maxOutOceans(player, 2);
    expect(card.canPlay(player)).is.true;
  });

  it('draws 2 cards and discards 1', () => {
    const card = new UnderwaterOutpost();
    const [game, player] = testGame(2);
    card.action(player);
    runAllActions(game);
    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(player.cardsInHand).has.length(2);
    selectCard.cb([player.cardsInHand[0]]);
    expect(player.cardsInHand).has.length(1);
  });
});
