import {expect} from 'chai';
import {VenusianCollaboration} from '../../../src/server/cards/betterments/VenusianCollaboration';
import {testGame} from '../../TestGame';
import {runAllActions, setVenusScaleLevel} from '../../TestingUtils';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';

describe('VenusianCollaboration', () => {
  it('raises TR and heat production per 10% Venus', () => {
    const card = new VenusianCollaboration();
    const [game, player] = testGame(2, {venusNextExtension: true});
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    expect(card.canPlay(player)).is.false;
    dirigibles.resourceCount = 1;
    expect(card.canPlay(player)).is.true;
    setVenusScaleLevel(game, 24);
    const tr = player.terraformRating;
    card.play(player);
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 2);
    expect(player.production.heat).eq(2);
    expect(dirigibles.resourceCount).eq(4);
  });
});
