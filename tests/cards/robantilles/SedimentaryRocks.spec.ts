import {expect} from 'chai';
import {SedimentaryRocks} from '../../../src/server/cards/robantilles/SedimentaryRocks';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';

describe('SedimentaryRocks', () => {
  it('lets any player build a city on the Sediment for 3 M€', () => {
    const card = new SedimentaryRocks();
    const [game, player, player2] = testGame(2);
    const selectSpace = cast(card.play(player), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.SEDIMENT);
    expect(space.player).eq(player);

    expect(game.board.getAvailableSpacesForCity(player2)).includes(space);
    game.addCity(player2, space);
    expect(space.tile?.tileType).eq(TileType.CITY);
    expect(space.player).eq(player2);
    expect(player2.megaCredits).eq(3);
  });
});
