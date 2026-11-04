import {expect} from 'chai';
import {UrbanPlanningStrategies} from '../../../src/server/cards/betterments/UrbanPlanningStrategies';
import {testGame} from '../../TestGame';
import {addCity, addGreenery, addOcean} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('UrbanPlanningStrategies', () => {
  function cityWithNeighbours(game: IGame) {
    const board = game.board;
    const center = board.spaces.find((s) => s.spaceType === SpaceType.LAND &&
      board.getAdjacentSpaces(s).filter((a) => a.spaceType === SpaceType.LAND).length >= 4)!;
    const neighbours = board.getAdjacentSpaces(center).filter((a) => a.spaceType === SpaceType.LAND);
    return {center, neighbours};
  }
  it('raises TR 2 per city next to an ocean and 2 greeneries', () => {
    const card = new UrbanPlanningStrategies();
    const [game, player] = testGame(2);
    const {center, neighbours} = cityWithNeighbours(game);
    addCity(player, center.id);
    addOcean(player, neighbours[0].id);
    addGreenery(player, neighbours[1].id);
    expect(UrbanPlanningStrategies.qualifyingCities(player)).eq(0);
    addGreenery(player, neighbours[2].id);
    expect(UrbanPlanningStrategies.qualifyingCities(player)).eq(1);
    const tr = player.terraformRating;
    card.play(player);
    expect(player.terraformRating).eq(tr + 2);
  });
});
