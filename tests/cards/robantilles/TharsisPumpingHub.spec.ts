import {expect} from 'chai';
import {TharsisPumpingHub} from '../../../src/server/cards/robantilles/TharsisPumpingHub';
import {testGame} from '../../TestGame';
import {maxOutOceans, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {TileType} from '../../../src/common/TileType';
import {Board} from '../../../src/server/boards/Board';

describe('TharsisPumpingHub', () => {
  it('places the Pumping Hub next to an ocean and stores energy', () => {
    const card = new TharsisPumpingHub();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    maxOutOceans(player, 3);
    expect(card.canPlay(player)).is.true;
    const selectSpace = cast(card.play(player), SelectSpace);
    const space = selectSpace.spaces[0];
    expect(game.board.getAdjacentSpaces(space).some(Board.isOceanSpace)).is.true;
    selectSpace.cb(space);
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.PUMPING_HUB);
    expect(player.production.energy).eq(1);

    player.playedCards.push(card);
    player.energy = 6;
    player.runProductionPhase();
    runAllActions(game);
    const selectAmount = cast(player.popWaitingFor(), SelectAmount);
    expect(selectAmount.min).eq(2);
  });
});
