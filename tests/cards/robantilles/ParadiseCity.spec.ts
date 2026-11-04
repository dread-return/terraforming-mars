import {expect} from 'chai';
import {ParadiseCity} from '../../../src/server/cards/robantilles/ParadiseCity';
import {testGame} from '../../TestGame';
import {maxOutOceans, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('ParadiseCity', () => {
  it('replaces your city next to an ocean and scores adjacent greeneries', () => {
    const card = new ParadiseCity();
    const [game, player] = testGame(2);
    const [ocean] = maxOutOceans(player, 1);
    expect(card.canPlay(player)).is.false;
    const land = game.board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    game.addCity(player, land);
    expect(card.canPlay(player)).is.true;
    cast(card.play(player), SelectSpace).cb(land);
    runAllActions(game);
    expect(land.tile?.tileType).eq(TileType.PARADISE_CITY);
    expect(game.board.getCities(player)).has.length(1);
    const next = game.board.getAdjacentSpaces(land).find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND)!;
    game.addGreenery(player, next);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
