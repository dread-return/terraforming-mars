import {expect} from 'chai';
import {CompanyCartel} from '../../../src/server/cards/betterments/CompanyCartel';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '../../../src/common/utils/utils';
import {CardName} from '../../../src/common/cards/CardName';

describe('CompanyCartel', () => {
  it('you keep 2, each opponent keeps 1, the rest are discarded', () => {
    const card = new CompanyCartel();
    const [game, player, player2] = testGame(2);
    const cards = Array.from({length: 4}, (_, i) => fakeCard({name: ('c' + i) as CardName}));
    game.projectDeck.drawPile.push(...cards);
    const discardsBefore = game.projectDeck.discardPile.length;
    card.play(player);
    runAllActions(game);
    const mine = cast(player.popWaitingFor(), SelectCard);
    expect(mine.cards).has.length(4);
    mine.cb([mine.cards[0], mine.cards[1]]);
    runAllActions(game);
    const theirs = cast(player2.popWaitingFor(), SelectCard);
    expect(theirs.cards).has.length(2);
    theirs.cb([theirs.cards[0]]);
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(player2.cardsInHand).has.length(1);
    expect(game.projectDeck.discardPile.length - discardsBefore).eq(1);
  });
});
