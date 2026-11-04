import {expect} from 'chai';
import {OrbitalBiologicalLaboratory} from '../../../src/server/cards/robantilles/OrbitalBiologicalLaboratory';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';

describe('OrbitalBiologicalLaboratory', () => {
  it('adds 2 microbes, or trades a microbe for 3 M€', () => {
    const card = new OrbitalBiologicalLaboratory();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);
    expect(card.resourceCount).eq(2);
    card.action(player);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb();
    runAllActions(game);
    expect(card.resourceCount).eq(1);
    expect(player.megaCredits).eq(3);
  });
});
