import {expect} from 'chai';
import {OpeningOfNaturalReserves} from '../../../src/server/cards/robantilles/OpeningOfNaturalReserves';
import {testGame} from '../../TestGame';
import {Birds} from '../../../src/server/cards/base/Birds';

describe('OpeningOfNaturalReserves', () => {
  it('scores 1 VP per 4 animals', () => {
    const card = new OpeningOfNaturalReserves();
    const birds = new Birds();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(birds, card);
    birds.resourceCount = 9;
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
