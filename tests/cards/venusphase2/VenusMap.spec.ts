import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions, setVenusScaleLevel} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {VenusPhase2Expansion} from '../../../src/server/venus2/VenusPhase2Expansion';
import {NamedVenusSpaces} from '../../../src/common/venus2/NamedVenusSpaces';
import {Game} from '../../../src/server/Game';
import {Stratopolis} from '../../../src/server/cards/venusNext/Stratopolis';
import {MaxwellBase} from '../../../src/server/cards/venusNext/MaxwellBase';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {PlaceVenusTile} from '../../../src/server/venus2/PlaceVenusTile';
import {Mayor} from '../../../src/server/milestones/Mayor';
import {Board} from '../../../src/server/boards/Board';
import {DysonScreens} from '../../../src/server/cards/pathfinders/DysonScreens';
import {VeneraBase} from '../../../src/server/cards/pathfinders/VeneraBase';
import {SeededRandom} from '../../../src/common/utils/Random';
import {VenusBoard} from '../../../src/server/venus2/VenusBoard';

function venusGame(players = 2, options = {}) {
  return testGame(players, {venusNextExtension: true, venusPhase2Expansion: true, ...options});
}

describe('Venus Phase 2 map', () => {
  it('only exists with Venus Next and Venus Phase 2', () => {
    expect(testGame(2)[0].venusMapData).is.undefined;
    const [noVenus] = testGame(2, {venusPhase2Expansion: true});
    expect(noVenus.venusMapData).is.undefined;
    const [game] = venusGame();
    expect(game.venusMapData).is.not.undefined;
  });

  it('has the GIGA board layout: 35 spaces, 12 yellow Gas Mine spaces, 2 reserved', () => {
    const [game] = venusGame();
    const board = VenusPhase2Expansion.board(game);
    expect(board.spaces).has.length(35);
    const gas = board.spaces.filter((s) => s.spaceType === SpaceType.VENUS_GAS_MINE);
    expect(gas).has.length(12);
    // Every yellow area has a heat bonus, and only those do.
    expect(gas.every((s) => s.bonus.every((b) => b === SpaceBonus.HEAT))).is.true;
    expect(board.spaces.filter((s) => s.bonus.includes(SpaceBonus.HEAT))).has.length(12);
    expect(board.getSpaceOrThrow('v08').bonus).deep.eq([SpaceBonus.HEAT, SpaceBonus.HEAT, SpaceBonus.HEAT]);
    expect(board.getSpaceOrThrow(NamedVenusSpaces.STRATOPOLIS).bonus).is.empty;
    expect(board.getSpaceOrThrow(NamedVenusSpaces.MAXWELL_BASE).bonus).is.empty;
    expect(board.A9['v12']).eq('3.3');
    expect(board.A9['v25']).eq('5.5');
  });

  it('Gas Mines go only on yellow areas; other tiles never do; reserved spaces stay free', () => {
    const [game, player] = venusGame();
    const gas = VenusPhase2Expansion.availableSpaces(player, TileType.VENUS_GAS_MINE);
    const land = VenusPhase2Expansion.availableSpaces(player, TileType.VENUS_FLOATING_ARRAY);
    expect(gas).has.length(12);
    expect(land).has.length(21);
    expect(land.map((s) => s.id)).does.not.include(NamedVenusSpaces.STRATOPOLIS);
    expect(land.map((s) => s.id)).does.not.include(NamedVenusSpaces.MAXWELL_BASE);
    expect(() => VenusPhase2Expansion.addTile(player, gas[0].id, {tileType: TileType.VENUS_HABITAT})).to.throw();
    expect(() => VenusPhase2Expansion.addTile(player, land[0].id, {tileType: TileType.VENUS_GAS_MINE})).to.throw();
    expect(game.venusMapData).is.not.undefined;
  });

  it('placing a Venus tile raises Venus, gives TR and the space bonus', () => {
    const [game, player] = venusGame();
    const tr = player.terraformRating;
    game.defer(new PlaceVenusTile(player, TileType.VENUS_GAS_MINE));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v08'));
    runAllActions(game);
    expect(game.getVenusScaleLevel()).eq(2);
    expect(player.terraformRating).eq(tr + 1);
    expect(player.heat).eq(3);
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_GAS_MINE)).eq(1);
  });

  it('tiles can still be placed once Venus is maxed, without raising it', () => {
    const [game, player] = venusGame();
    setVenusScaleLevel(game, 30);
    const tr = player.terraformRating;
    VenusPhase2Expansion.addTile(player, 'v02', {tileType: TileType.VENUS_FLOATING_ARRAY});
    expect(game.getVenusScaleLevel()).eq(30);
    expect(player.terraformRating).eq(tr);
  });

  it('scores 1 VP per adjacent Floating Array (anyone\'s) for Habitats, Gas Mines and cities', () => {
    const [game, player, other] = venusGame();
    // v12 (Stratopolis) neighbours include v07, v08, v11, v13.
    const board = VenusPhase2Expansion.board(game);
    const neighbours = board.getAdjacentSpaces(board.getSpaceOrThrow('v13')).map((s) => s.id);
    expect(neighbours).includes('v08');
    VenusPhase2Expansion.addTile(player, 'v08', {tileType: TileType.VENUS_GAS_MINE});
    VenusPhase2Expansion.addTile(player, 'v13', {tileType: TileType.VENUS_FLOATING_ARRAY});
    VenusPhase2Expansion.addTile(other, 'v09', {tileType: TileType.VENUS_FLOATING_ARRAY});
    // v08 (Gas Mine) touches v13 and v09: 2 VP. Floating Arrays score nothing.
    expect(player.getVictoryPoints().venusTiles).eq(2);
    expect(other.getVictoryPoints().venusTiles).eq(0);
  });

  it('survives serialization', () => {
    const [game, player] = venusGame();
    VenusPhase2Expansion.addTile(player, 'v02', {tileType: TileType.VENUS_HABITAT});
    VenusPhase2Expansion.addCity(player, NamedVenusSpaces.STRATOPOLIS);
    const game2 = Game.deserialize(game.serialize());
    const space = VenusPhase2Expansion.board(game2).getSpaceOrThrow('v02');
    expect(space.tile?.tileType).eq(TileType.VENUS_HABITAT);
    expect(space.player?.id).eq(player.id);
    // Venus cities still count after loading.
    expect(game2.board.getCities(game2.getPlayerById(player.id))).has.length(1);
  });

  it('Stratopolis and Maxwell Base put their cities on the Venus map', () => {
    const [game, player] = venusGame();
    player.tagsForTest = {science: 2};
    const stratopolis = new Stratopolis();
    expect(stratopolis.canPlay(player)).is.true;
    player.playCard(stratopolis);
    runAllActions(game);
    const venusSpace = VenusPhase2Expansion.board(game).getSpaceOrThrow(NamedVenusSpaces.STRATOPOLIS);
    expect(venusSpace.tile?.tileType).eq(TileType.CITY);
    // The off-world Stratopolis space isn't on the Mars board in Venus Phase 2 games.
    expect(game.board.spaces.map((s) => s.id)).does.not.include(SpaceName.STRATOPOLIS);
    // Placed once only.
    expect(stratopolis.canPlay(player)).is.false;

    setVenusScaleLevel(game, 12);
    const maxwell = new MaxwellBase();
    player.playCard(maxwell);
    runAllActions(game);
    expect(VenusPhase2Expansion.board(game).getSpaceOrThrow(NamedVenusSpaces.MAXWELL_BASE).tile?.tileType).eq(TileType.CITY);
  });

  it('cities on Venus count as cities in space; Venus Habitats are not cities', () => {
    const [game, player] = venusGame();
    VenusPhase2Expansion.addTile(player, 'v02', {tileType: TileType.VENUS_HABITAT});
    expect(game.board.getCities(player)).is.empty;
    VenusPhase2Expansion.addCity(player, 'v03');
    expect(game.board.getCities(player)).has.length(1);
    expect(game.board.getCitiesOffMars(player)).has.length(1);
    expect(game.board.getCitiesOnMars(player)).is.empty;
    expect(new Mayor().getScore(player)).eq(1);
    // The Mars board doesn't see Venus neighbours.
    expect(game.board.getAdjacentSpaces(VenusPhase2Expansion.board(game).getSpaceOrThrow('v03'))).is.empty;
    expect(Board.isCitySpace(VenusPhase2Expansion.board(game).getSpaceOrThrow('v03'))).is.true;
  });

  it('leaves Stratopolis, Maxwell Base, Dyson Screens and Venera Base off the Mars board', () => {
    const options = {pathfindersExpansion: true, turmoilExtension: true};
    const [game] = venusGame(2, options);
    const ids = game.board.spaces.map((s) => s.id);
    for (const space of [SpaceName.STRATOPOLIS, SpaceName.MAXWELL_BASE, SpaceName.DYSON_SCREENS, SpaceName.VENERA_BASE]) {
      expect(ids).does.not.include(space);
    }
    // Other off-world spaces stay.
    expect(ids).includes(SpaceName.DAWN_CITY);
    expect(ids).includes(SpaceName.CERES_SPACEPORT);

    const [plain] = testGame(2, {venusNextExtension: true, ...options});
    const plainIds = plain.board.spaces.map((s) => s.id);
    expect(plainIds).includes(SpaceName.STRATOPOLIS);
    expect(plainIds).includes(SpaceName.DYSON_SCREENS);
    expect(plainIds).includes(SpaceName.VENERA_BASE);
  });

  it('Dyson Screens and Venera Base put their cities on any non-Gas-Mine Venus space', () => {
    const [game, player] = venusGame(2, {pathfindersExpansion: true, turmoilExtension: true});
    player.playCard(new DysonScreens());
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    expect(select.spaces).has.length(21);
    expect(select.spaces.some((s) => s.spaceType === SpaceType.VENUS_GAS_MINE)).is.false;
    select.cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v02'));
    runAllActions(game);
    expect(VenusPhase2Expansion.board(game).getSpaceOrThrow('v02').tile).deep.eq({tileType: TileType.CITY, card: 'Dyson Screens'});

    player.playCard(new VeneraBase());
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v04'));
    runAllActions(game);
    expect(VenusPhase2Expansion.cities(game)).has.length(2);

    // v03 sits between them: a Floating Array there is worth 1 VP to each city.
    VenusPhase2Expansion.addTile(player, 'v03', {tileType: TileType.VENUS_FLOATING_ARRAY});
    expect(player.getVictoryPoints().venusTiles).eq(2);
  });

  it('can\'t play Dyson Screens with no Venus space left', () => {
    const [game, player] = venusGame(2, {pathfindersExpansion: true});
    for (const space of VenusPhase2Expansion.availableSpaces(player, TileType.CITY)) {
      VenusPhase2Expansion.addTile(player, space.id, {tileType: TileType.VENUS_FLOATING_ARRAY});
    }
    expect(new DysonScreens().canPlay(player)).is.false;
    expect(game.venusMapData).is.not.undefined;
  });

  it('Randomize tiles shuffles the Venus map; Gas Mine areas keep their heat, reserved spaces stay', () => {
    const normal = VenusBoard.newInstance();
    let differs = false;
    for (let seed = 1; seed <= 5; seed++) {
      const board = VenusBoard.newInstance(new SeededRandom(seed));
      const gas = board.spaces.filter((s) => s.spaceType === SpaceType.VENUS_GAS_MINE);
      expect(gas).has.length(12);
      expect(gas.every((s) => s.bonus.length > 0 && s.bonus.every((b) => b === SpaceBonus.HEAT))).is.true;
      expect(board.getSpaceOrThrow(NamedVenusSpaces.STRATOPOLIS).spaceType).eq(SpaceType.LAND);
      expect(board.getSpaceOrThrow(NamedVenusSpaces.MAXWELL_BASE).bonus).is.empty;
      if (board.spaces.some((s, i) => s.spaceType !== normal.spaces[i].spaceType)) {
        differs = true;
      }
    }
    expect(differs).is.true;

    const [game] = venusGame(2, {shuffleMapOption: true});
    expect(VenusPhase2Expansion.board(game).spaces.filter((s) => s.spaceType === SpaceType.VENUS_GAS_MINE)).has.length(12);
  });
});
