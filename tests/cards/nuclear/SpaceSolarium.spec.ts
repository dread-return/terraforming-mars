import {expect} from 'chai';
import {SpaceSolarium} from '../../../src/server/cards/nuclear/SpaceSolarium';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {TileType} from '../../../src/common/TileType';
import {CardName} from '../../../src/common/cards/CardName';
import {Board} from '../../../src/server/boards/Board';
import {Units} from '../../../src/common/Units';

describe('SpaceSolarium', () => {
  it('is on the board only with Nuclear and Prelude', () => {
    const [game] = testGame(2, {nuclearExpansion: true, preludeExtension: true});
    expect(game.board.getSpaceOrThrow(SpaceName.SPACE_SOLARIUM).spaceType).eq(SpaceType.COLONY);
    const [noPrelude] = testGame(2, {nuclearExpansion: true});
    expect(noPrelude.board.spaces.find((s) => s.id === SpaceName.SPACE_SOLARIUM)).is.undefined;
    const [noNuclear] = testGame(2, {preludeExtension: true});
    expect(noNuclear.board.spaces.find((s) => s.id === SpaceName.SPACE_SOLARIUM)).is.undefined;
  });

  it('places a greenery next to a reserved city area that is not built yet', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true, preludeExtension: true, pathfindersExpansion: true});
    const card = new SpaceSolarium();
    expect(card.canPlay(player)).is.true;

    const oxygen = game.getOxygenLevel();
    const tr = player.terraformRating;
    const select = cast(card.play(player), SelectSpace);
    runAllActions(game);
    expect(player.stock.asUnits()).deep.eq(Units.of({plants: 5}));
    const ids = select.spaces.map((s) => s.id);
    expect(ids).includes(SpaceName.GANYMEDE_COLONY);
    expect(ids).includes(SpaceName.DYSON_SCREENS);
    expect(ids).does.not.include(SpaceName.SPACE_SOLARIUM);

    const dyson = game.board.getSpaceOrThrow(SpaceName.DYSON_SCREENS);
    select.cb(dyson);
    runAllActions(game);
    const solarium = game.board.getSpaceOrThrow(SpaceName.SPACE_SOLARIUM);
    expect(solarium.tile?.tileType).eq(TileType.GREENERY);
    expect(solarium.player).eq(player);
    expect(game.getOxygenLevel()).eq(oxygen + 1);
    expect(player.terraformRating).eq(tr + 1);
    expect(game.board.getGreeneries(player)).has.length(1);

    // Building Dyson Screens later makes the Solarium an adjacent greenery.
    game.addCity(player, dyson, CardName.DYSON_SCREENS);
    expect(game.board.getAdjacentSpaces(dyson).filter(Board.isGreenerySpace)).deep.eq([solarium]);

    // Only one Solarium.
    expect(card.canPlay(player)).is.false;
  });

  it('can go next to a built city, but not next to an off-world greenery', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true, preludeExtension: true});
    const ganymede = game.board.getSpaceOrThrow(SpaceName.GANYMEDE_COLONY);
    game.addCity(player, ganymede, CardName.GANYMEDE_COLONY);
    const ids = SpaceSolarium.reservedCitySpaces(player).map((s) => s.id);
    expect(ids).includes(SpaceName.GANYMEDE_COLONY);
    expect(ids).does.not.include(SpaceName.SPACE_SOLARIUM);
    expect(ids).does.not.include(SpaceName.FLYING_GARDEN);
  });
});
