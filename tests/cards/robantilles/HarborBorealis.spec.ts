import {expect} from 'chai';
import {HarborBorealis} from '../../../src/server/cards/robantilles/HarborBorealis';
import {testGame} from '../../TestGame';
import {maxOutOceans, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';
import {Board} from '../../../src/server/boards/Board';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('HarborBorealis', () => {
  it('goes over an ocean next to a city', () => {
    const card = new HarborBorealis();
    const [game, player] = testGame(2);
    const oceans = maxOutOceans(player, 5);
    expect(card.canPlay(player)).is.false;
    const ocean = oceans[0];
    const land = game.board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    game.addCity(player, land);
    expect(card.canPlay(player)).is.true;
    const selectSpace = cast(card.play(player), SelectSpace);
    expect(selectSpace.spaces).includes(ocean);
    selectSpace.cb(ocean);
    runAllActions(game);
    expect(ocean.tile?.tileType).eq(TileType.HARBOR);
    expect(Board.isOceanSpace(ocean)).is.true;
    const adjacentOceans = game.board.getAdjacentSpaces(ocean).filter(Board.isOceanSpace).length;
    expect(player.production.megacredits).eq(adjacentOceans);
    player.playedCards.push(card);
    expect(card.getVictoryPoints(player)).eq(adjacentOceans);
  });
});
