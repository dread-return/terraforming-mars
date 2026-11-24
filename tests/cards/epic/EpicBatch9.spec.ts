import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Board} from '../../../src/server/boards/Board';
import {Space} from '../../../src/server/boards/Space';
import {PlaceGreeneryTile} from '../../../src/server/deferredActions/PlaceGreeneryTile';
import {Atlantis} from '../../../src/server/cards/epic/Atlantis';
import {Babylonia} from '../../../src/server/cards/epic/Babylonia';
import {BolsonConstruction} from '../../../src/server/cards/epic/BolsonConstruction';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

/** Puts an ocean on an ocean space that has a free land space next to it. */
function oceanWithLandNextToIt(game: IGame, player: TestPlayer): {ocean: Space, land: Space} {
  const board = game.board;
  for (const ocean of board.getAvailableSpacesForOcean(player)) {
    const land = board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined);
    if (land !== undefined) {
      game.addTile(player, ocean, {tileType: TileType.OCEAN});
      return {ocean, land};
    }
  }
  throw new Error('no ocean space next to land');
}

describe('Epic Corporations batch 9 (cities and greeneries on oceans)', () => {
  it('Atlantis: cities may go on oceans, counting as both', () => {
    const corp = new Atlantis();
    const [game, player, other] = withCorp(corp);
    const {ocean} = oceanWithLandNextToIt(game, other);
    const oceans = game.board.getOceanSpaces().length;
    expect(game.board.getAvailableSpacesForCity(player)).contains(ocean);
    expect(game.board.getAvailableSpacesForCity(other)).not.contains(ocean);

    game.addTile(player, ocean, {tileType: TileType.CITY});
    expect(ocean.tile?.tileType).eq(TileType.OCEAN_CITY);
    expect(ocean.player).eq(player);
    expect(Board.isCitySpace(ocean)).is.true;
    expect(Board.isOceanSpace(ocean)).is.true;
    expect(game.board.getOceanSpaces().length).eq(oceans);
    expect(game.board.getCities(player)).deep.eq([ocean]);
  });

  it('Atlantis: an ocean next to its ocean city pays 2 M€; it scores oceans instead of greeneries', () => {
    const corp = new Atlantis();
    const [game, player, other] = withCorp(corp);
    const board = game.board;
    const {ocean} = oceanWithLandNextToIt(game, other);
    game.addTile(player, ocean, {tileType: TileType.CITY});

    const nextOcean = board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.OCEAN && s.tile === undefined);
    if (nextOcean !== undefined) {
      const before = player.megaCredits;
      game.addTile(other, nextOcean, {tileType: TileType.OCEAN});
      expect(player.megaCredits).eq(before + 2);
    }
    const land = board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    game.simpleAddTile(other, land, {tileType: TileType.GREENERY});
    const adjacent = board.getAdjacentSpaces(ocean);
    expect(corp.getVictoryPoints(player)).eq(adjacent.filter(Board.isOceanSpace).length - adjacent.filter(Board.isGreenerySpace).length);
  });

  it('Bolson Construction: steel pays for the city project, and cities may go on oceans', () => {
    const corp = new BolsonConstruction();
    const [game, player, other] = withCorp(corp);
    expect(player.production.steel).eq(2);
    const city = new CityStandardProject();
    const select = new SelectStandardProjectToPlay(player, [city]);
    expect(select.paymentRulesFor(city).canPayWith.steel).is.true;
    player.megaCredits = 1;
    player.steel = 12;
    expect(city.canAct(player)).is.true;

    const {ocean} = oceanWithLandNextToIt(game, other);
    expect(game.board.getAvailableSpacesForCity(player)).contains(ocean);
    game.addTile(player, ocean, {tileType: TileType.CITY});
    expect(ocean.tile?.tileType).eq(TileType.OCEAN_CITY);
  });

  it('Babylonia: a greenery may go on an ocean next to your tiles, for 2 M€; it counts as both', () => {
    const corp = new Babylonia();
    const [game, player, other] = withCorp(corp);
    expect(player.plants).eq(4);
    const {ocean, land} = oceanWithLandNextToIt(game, other);
    // Before Babylonia has any tile, any plain ocean will do.
    expect(game.board.getAvailableSpacesForGreenery(player)).contains(ocean);
    game.simpleAddTile(player, land, {tileType: TileType.CITY});
    expect(game.board.getAvailableSpacesForGreenery(player)).contains(ocean);

    const oceans = game.board.getOceanSpaces().length;
    const before = player.megaCredits;
    game.defer(new PlaceGreeneryTile(player));
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(ocean);
    runAllActions(game);
    expect(ocean.tile?.tileType).eq(TileType.OCEAN_GREENERY);
    expect(ocean.player).eq(player);
    expect(Board.isGreenerySpace(ocean)).is.true;
    expect(Board.isOceanSpace(ocean)).is.true;
    expect(game.board.getOceanSpaces().length).eq(oceans);
    expect(game.getOxygenLevel()).eq(1);
    expect(player.megaCredits).eq(before + 2);
    // Other players' greeneries can't go on oceans.
    expect(game.board.getAvailableSpacesForGreenery(other).some((s) => s.spaceType === SpaceType.OCEAN)).is.false;
  });
});
