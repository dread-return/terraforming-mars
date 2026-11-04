import {expect} from 'chai';
import {GreeneryEmbellishment} from '../../../src/server/cards/betterments/GreeneryEmbellishment';
import {testGame} from '../../TestGame';
import {addCity, addGreenery} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('GreeneryEmbellishment', () => {
  function cityWithNeighbours(game: IGame) {
    const board = game.board;
    const center = board.spaces.find((s) => s.spaceType === SpaceType.LAND &&
      board.getAdjacentSpaces(s).filter((a) => a.spaceType === SpaceType.LAND).length >= 4)!;
    const neighbours = board.getAdjacentSpaces(center).filter((a) => a.spaceType === SpaceType.LAND);
    return {center, neighbours};
  }
  it('raises M€ production 2 steps per city next to a greenery', () => {
    const card = new GreeneryEmbellishment();
    const [game, player] = testGame(2);
    const {center, neighbours} = cityWithNeighbours(game);
    addCity(player, center.id);
    addGreenery(player, neighbours[0].id);
    card.play(player);
    expect(player.production.megacredits).eq(2);
  });
});
