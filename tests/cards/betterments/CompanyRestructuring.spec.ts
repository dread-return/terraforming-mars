import {expect} from 'chai';
import {CompanyRestructuring} from '../../../src/server/cards/betterments/CompanyRestructuring';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '../../../src/common/utils/utils';

describe('CompanyRestructuring', () => {
  it('lets you and each opponent discard cards for M€', () => {
    const card = new CompanyRestructuring();
    const [game, player, player2] = testGame(2);
    player.cardsInHand.push(fakeCard(), fakeCard(), fakeCard());
    player2.cardsInHand.push(fakeCard(), fakeCard());
    card.play(player);
    runAllActions(game);
    const mine = cast(player.popWaitingFor(), SelectCard);
    mine.cb(player.cardsInHand.slice(0, 2));
    runAllActions(game);
    const theirs = cast(player2.popWaitingFor(), SelectCard);
    theirs.cb([player2.cardsInHand[0]]);
    runAllActions(game);
    expect(player.cardsInHand).has.length(1);
    expect(player.megaCredits).eq(6);
    expect(player2.cardsInHand).has.length(1);
    expect(player2.megaCredits).eq(2);
  });
});
