import {expect} from 'chai';
import {IndustrialMetropolis} from '../../../src/server/cards/robantilles/IndustrialMetropolis';
import {testGame} from '../../TestGame';
import {addCity, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';

describe('IndustrialMetropolis', () => {
  it('goes on top of your city and scores adjacent special tiles', () => {
    const card = new IndustrialMetropolis();
    const [game, player, player2] = testGame(2);
    player.production.override({energy: 1});
    expect(card.canPlay(player)).is.false;
    const city = addCity(player);
    expect(card.canPlay(player)).is.true;
    const selectSpace = cast(card.play(player), SelectSpace);
    selectSpace.cb(city);
    runAllActions(game);
    expect(city.tile?.tileType).eq(TileType.METROPOLIS);
    expect(player.production.energy).eq(0);
    expect(player.production.steel).eq(1);
    expect(card.getVictoryPoints(player)).eq(0);
    const next = game.board.getAdjacentSpaces(city).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    game.addTile(player2, next, {tileType: TileType.MOHOLE_AREA});
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
