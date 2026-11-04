import {expect} from 'chai';
import {NeptuneExpedition} from '../../../src/server/cards/robantilles/NeptuneExpedition';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('NeptuneExpedition', () => {
  it('draws a card per Jovian tag, including this', () => {
    const card = new NeptuneExpedition();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN]}));
    card.play(player);
    expect(player.cardsInHand).has.length(2);
  });
});
