import {expect} from 'chai';
import {VenusianFluctuatingPlants} from '../../../src/server/cards/betterments/VenusianFluctuatingPlants';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('VenusianFluctuatingPlants', () => {
  it('spends 3 plants to add 2 floaters', () => {
    const card = new VenusianFluctuatingPlants();
    const [game, player] = testGame(2, {venusNextExtension: true});
    player.playedCards.push(card);
    player.plants = 3;
    card.action(player);
    runAllActions(game);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[1].cb(undefined);
    runAllActions(game);
    expect(player.plants).eq(0);
    expect(card.resourceCount).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
