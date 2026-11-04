import {expect} from 'chai';
import {DataLibrary} from '../../../src/server/cards/robantilles/DataLibrary';
import {testGame} from '../../TestGame';

describe('DataLibrary', () => {
  it('draws a card each time 2 data collect here', () => {
    const card = new DataLibrary();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    card.action(player);
    expect(card.resourceCount).eq(1);
    expect(player.cardsInHand).has.length(0);
    card.action(player);
    expect(card.resourceCount).eq(0);
    expect(player.cardsInHand).has.length(1);
  });
});
