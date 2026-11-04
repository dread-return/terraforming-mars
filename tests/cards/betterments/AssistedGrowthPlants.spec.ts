import {expect} from 'chai';
import {AssistedGrowthPlants} from '../../../src/server/cards/betterments/AssistedGrowthPlants';
import {testGame} from '../../TestGame';
import {runAllActions, setOxygenLevel} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '../../../src/common/utils/utils';

describe('AssistedGrowthPlants', () => {
  it('requires maximum oxygen and places 3 greeneries', () => {
    const card = new AssistedGrowthPlants();
    const [game, player] = testGame(2);
    setOxygenLevel(game, 13);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 14);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    for (let i = 0; i < 3; i++) {
      runAllActions(game);
      const selectSpace = cast(player.popWaitingFor(), SelectSpace);
      selectSpace.cb(selectSpace.spaces[0]);
    }
    expect(game.board.getGreeneries(player)).has.length(3);
  });
});
