import {expect} from 'chai';
import {OrganicWasteRecycling} from '../../../src/server/cards/robantilles/OrganicWasteRecycling';
import {testGame} from '../../TestGame';
import {addCity} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';

describe('OrganicWasteRecycling', () => {
  it('hosts a microbe card with a resource per city, which discounts it', () => {
    const card = new OrganicWasteRecycling();
    const tardigrades = new Tardigrades();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    expect(card.canAct(player)).is.false;
    addCity(player);
    addCity(player);
    player.cardsInHand.push(tardigrades);
    expect(card.canAct(player)).is.true;
    cast(card.action(player), SelectCard).cb([tardigrades]);
    expect(player.cardsInHand).has.length(0);
    expect(card.targetCards).deep.eq([tardigrades]);
    expect(tardigrades.resourceCount).eq(2);
    expect(player.getCardCost(tardigrades)).eq(2);
    player.megaCredits = 2;
    expect(player.getPlayableCards().map((c) => c.name)).includes(tardigrades.name);

    player.playCard(tardigrades);
    expect(card.targetCards).has.length(0);
  });
});
