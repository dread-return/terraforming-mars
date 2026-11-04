import {expect} from 'chai';
import {Pipes} from '../../../src/server/cards/betterments/Pipes';
import {testGame} from '../../TestGame';
import {addCity, addOcean} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('Pipes', () => {
  function cityWithNeighbours(game: IGame) {
    const board = game.board;
    const center = board.spaces.find((s) => s.spaceType === SpaceType.LAND &&
      board.getAdjacentSpaces(s).filter((a) => a.spaceType === SpaceType.LAND).length >= 4)!;
    const neighbours = board.getAdjacentSpaces(center).filter((a) => a.spaceType === SpaceType.LAND);
    return {center, neighbours};
  }
  it('gains 1 M€ per owned tile next to an ocean', () => {
    const card = new Pipes();
    const [game, player] = testGame(2);
    const {center, neighbours} = cityWithNeighbours(game);
    addCity(player, center.id);
    addOcean(player, neighbours[0].id);
    player.megaCredits = 0; // Ignore the ocean adjacency bonus.
    card.play(player);
    expect(player.megaCredits).eq(1);
  });
});
