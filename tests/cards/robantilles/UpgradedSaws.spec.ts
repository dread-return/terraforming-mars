import {expect} from 'chai';
import {UpgradedSaws} from '../../../src/server/cards/robantilles/UpgradedSaws';
import {testGame} from '../../TestGame';
import {addGreenery} from '../../TestingUtils';

describe('UpgradedSaws', () => {
  it('raises M€ production when you place a greenery', () => {
    const card = new UpgradedSaws();
    const [/* game */, player, player2] = testGame(2);
    player.playedCards.push(card);
    addGreenery(player);
    expect(player.production.megacredits).eq(1);
    addGreenery(player2);
    expect(player.production.megacredits).eq(1);
  });
});
