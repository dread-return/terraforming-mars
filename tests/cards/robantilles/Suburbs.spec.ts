import {expect} from 'chai';
import {Suburbs} from '../../../src/server/cards/robantilles/Suburbs';
import {testGame} from '../../TestGame';
import {addGreenery, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';
import {Board} from '../../../src/server/boards/Board';

describe('Suburbs', () => {
  it('goes on top of your greenery and counts as a city', () => {
    const card = new Suburbs();
    const [game, player, player2] = testGame(2);
    expect(card.canPlay(player)).is.false;
    const greenery = addGreenery(player);
    expect(card.canPlay(player)).is.true;
    const selectSpace = cast(card.play(player), SelectSpace);
    expect(selectSpace.spaces).deep.eq([greenery]);
    selectSpace.cb(greenery);
    runAllActions(game);
    expect(player.production.megacredits).eq(3);
    expect(greenery.tile?.tileType).eq(TileType.SUBURBS);
    expect(Board.isCitySpace(greenery)).is.true;
    expect(game.board.getCities(player)).has.length(1);

    // Adjacency bonus: placing next to it pays 1 M€ to the placer and 1 M€ to the owner.
    const next = game.board.getAdjacentSpaces(greenery).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    player.megaCredits = 0;
    game.addGreenery(player2, next);
    expect(player2.megaCredits).eq(1);
    expect(player.megaCredits).eq(1);
  });
});
