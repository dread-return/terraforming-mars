import {expect} from 'chai';
import {Ecoplants} from '../../../src/server/cards/robantilles/Ecoplants';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';

describe('Ecoplants', () => {
  it('requires plant production and makes greeneries cheaper', () => {
    const card = new Ecoplants();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.production.override({plants: 1});
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.plantsNeededForGreenery).eq(7);
    expect(card.getCardDiscount(player, fakeCard({behavior: {greenery: {}}}))).eq(2);
    expect(card.getCardDiscount(player, fakeCard({}))).eq(0);
  });
});
