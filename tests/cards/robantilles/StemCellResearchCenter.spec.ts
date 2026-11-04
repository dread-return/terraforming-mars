import {expect} from 'chai';
import {StemCellResearchCenter} from '../../../src/server/cards/robantilles/StemCellResearchCenter';
import {testGame} from '../../TestGame';
import {addCity, runAllActions} from '../../TestingUtils';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';

describe('StemCellResearchCenter', () => {
  it('raises M€ production 2 steps and adds a microbe whenever any city is placed', () => {
    const card = new StemCellResearchCenter();
    const tardigrades = new Tardigrades();
    const [game, player, player2] = testGame(2);
    player.playedCards.push(tardigrades);
    card.play(player);
    expect(player.production.megacredits).eq(2);
    player.playedCards.push(card);
    addCity(player2);
    runAllActions(game);
    expect(tardigrades.resourceCount).eq(1);
  });
});
