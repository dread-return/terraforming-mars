import {expect} from 'chai';
import {GIGAInterferometer} from '../../../src/server/cards/robantilles/GIGAInterferometer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';

describe('GIGAInterferometer', () => {
  it('requires every player to have 6 M€, then runs a research phase', () => {
    const card = new GIGAInterferometer();
    const [game, player, player2] = testGame(2);
    player.megaCredits = 6;
    expect(card.canPlay(player)).is.false;
    player2.megaCredits = 6;
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).has.length(4);
    selectCard.cb([selectCard.cards[0]]);
    runAllActions(game);
    // Player 2 picks next, then player 1 pays.
    cast(player2.popWaitingFor(), SelectCard).cb([]);
    runAllActions(game);
    expect(player.cardsInHand).has.length(1);
    expect(player.megaCredits).eq(3);
  });
});
