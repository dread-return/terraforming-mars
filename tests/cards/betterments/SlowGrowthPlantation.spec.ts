import {expect} from 'chai';
import {SlowGrowthPlantation} from '../../../src/server/cards/betterments/SlowGrowthPlantation';
import {testGame} from '../../TestGame';
import {runAllActions, setOxygenLevel} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '../../../src/common/utils/utils';
import {TileType} from '../../../src/common/TileType';

describe('SlowGrowthPlantation', () => {
  it('requires 4% oxygen and starts with 3 microbes', () => {
    const card = new SlowGrowthPlantation();
    const [game, player] = testGame(2);
    setOxygenLevel(game, 3);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 4);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.play(player);
    runAllActions(game);
    expect(card.resourceCount).eq(3);
  });

  it('removes 5 microbes to place a greenery', () => {
    const card = new SlowGrowthPlantation();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    card.resourceCount = 5;
    card.action(player);
    runAllActions(game);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[1].cb(undefined);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    expect(card.resourceCount).eq(0);
    expect(space.tile?.tileType).eq(TileType.GREENERY);
  });
});
