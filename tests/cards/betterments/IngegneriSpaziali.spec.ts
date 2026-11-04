import {expect} from 'chai';
import {IngegneriSpaziali} from '../../../src/server/cards/betterments/IngegneriSpaziali';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '../../../src/common/utils/utils';
import {CardName} from '../../../src/common/cards/CardName';

describe('IngegneriSpaziali', () => {
  it('takes the space cards, then each opponent picks one', () => {
    const card = new IngegneriSpaziali();
    const [game, player, player2] = testGame(2);
    const space1 = fakeCard({name: 'space1' as CardName, tags: [Tag.SPACE]});
    const space2 = fakeCard({name: 'space2' as CardName, tags: [Tag.SPACE, Tag.JOVIAN]});
    const others = Array.from({length: 8}, (_, i) => fakeCard({name: ('other' + i) as CardName, tags: [Tag.PLANT]}));
    // The top of the deck is the end of the draw pile.
    game.projectDeck.drawPile.push(...others, space1, space2);
    const discardsBefore = game.projectDeck.discardPile.length;
    card.play(player);
    runAllActions(game);
    expect(player.cardsInHand.map((c) => c.name)).to.have.members(['space1', 'space2']);
    const pick = cast(player2.popWaitingFor(), SelectCard);
    expect(pick.cards).has.length(8);
    pick.cb([pick.cards[0]]);
    runAllActions(game);
    expect(player2.cardsInHand).has.length(1);
    expect(game.projectDeck.discardPile.length - discardsBefore).eq(7);
  });
});
