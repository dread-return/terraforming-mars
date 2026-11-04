import {expect} from 'chai';
import {MausoleumAtHellas} from '../../../src/server/cards/robantilles/MausoleumAtHellas';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';

describe('MausoleumAtHellas', () => {
  it('turns a discarded card into a relic', () => {
    const card = new MausoleumAtHellas();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    expect(card.canAct(player)).is.false;
    player.cardsInHand.push(fakeCard());
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    const selectCard = player.popWaitingFor();
    if (selectCard !== undefined) {
      cast(selectCard, SelectCard).cb([player.cardsInHand[0]]);
      runAllActions(game);
    }
    expect(player.cardsInHand).has.length(0);
    expect(card.resourceCount).eq(1);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
