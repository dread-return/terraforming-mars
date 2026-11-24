import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {Resource} from '../../../src/common/Resource';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Space} from '../../../src/server/boards/Space';
import {RedDragonSyndicate} from '../../../src/server/cards/epic/RedDragonSyndicate';
import {BeyondHolidays} from '../../../src/server/cards/epic/BeyondHolidays';
import {BloomingVales} from '../../../src/server/cards/epic/BloomingVales';
import {Eletrop} from '../../../src/server/cards/epic/Eletrop';
import {ColdFusion} from '../../../src/server/cards/epic/ColdFusion';
import {Asteroid} from '../../../src/server/cards/base/Asteroid';
import {AsteroidMining} from '../../../src/server/cards/base/AsteroidMining';
import {AsteroidStandardProject} from '../../../src/server/cards/base/standardProjects/AsteroidStandardProject';
import {DomedCrater} from '../../../src/server/cards/base/DomedCrater';
import {MagneticFieldGenerators} from '../../../src/server/cards/base/MagneticFieldGenerators';
import {Energizer} from '../../../src/server/milestones/Energizer';
import {energyStorageCapacity} from '../../../src/server/cards/robantilles/EnergyStorage';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

/** A free land space whose neighbours are all free land spaces. */
function openSpace(game: IGame): Space {
  const board = game.board;
  return board.spaces.find((space) =>
    space.spaceType === SpaceType.LAND && space.tile === undefined && space.bonus.length === 0 &&
    board.getAdjacentSpaces(space).length === 6 &&
    board.getAdjacentSpaces(space).every((s) => s.spaceType === SpaceType.LAND && s.tile === undefined))!;
}

describe('Epic Corporations batch 13', () => {
  it('Red Dragon Syndicate: an asteroid lets it build a city where the player picks', () => {
    const corp = new RedDragonSyndicate();
    const [game, player, other] = withCorp(corp);
    expect(player.titanium).eq(2);
    player.megaCredits = 20;

    expect(RedDragonSyndicate.isImpact(new AsteroidMining())).is.false;
    corp.onCardPlayedByAnyPlayer(player, new Asteroid(), other);
    runAllActions(game);
    const pick = cast(other.popWaitingFor(), SelectSpace);
    const space = pick.spaces[0];
    pick.cb(space);
    runAllActions(game);
    const choice = cast(player.popWaitingFor(), OrOptions);
    choice.options[0].cb();
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.CITY);
    expect(space.player).eq(player);
    expect(player.megaCredits).eq(7);
  });

  it('Red Dragon Syndicate: the asteroid standard project triggers it; declining builds nothing', () => {
    const corp = new RedDragonSyndicate();
    const [game, player, other] = withCorp(corp);
    player.megaCredits = 20;
    corp.onStandardProjectByAnyPlayer(player, other, new AsteroidStandardProject());
    runAllActions(game);
    const pick = cast(other.popWaitingFor(), SelectSpace);
    const space = pick.spaces[0];
    pick.cb(space);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb();
    expect(space.tile).is.undefined;
    expect(player.megaCredits).eq(20);

    // Without 13 M€ nothing happens.
    player.megaCredits = 12;
    corp.onStandardProjectByAnyPlayer(player, other, new AsteroidStandardProject());
    runAllActions(game);
    expect(other.popWaitingFor()).is.undefined;
  });

  it('Beyond Holidays: its tiles drop two 5 M€ tokens that anyone can claim', () => {
    const corp = new BeyondHolidays();
    const [game, player, other] = withCorp(corp);
    const space = openSpace(game);
    game.addCity(player, space);
    runAllActions(game);
    const first = cast(player.popWaitingFor(), SelectSpace);
    const a = first.spaces[0];
    first.cb(a);
    runAllActions(game);
    const second = cast(player.popWaitingFor(), SelectSpace);
    expect(second.spaces).not.contains(a);
    second.cb(second.spaces[0]);
    runAllActions(game);
    expect(corp.data.tokens).has.length(2);

    const mc = other.megaCredits;
    game.addGreenery(other, a);
    runAllActions(game);
    expect(other.megaCredits).eq(mc + 5);
    expect(corp.data.tokens).has.length(1);
  });

  it('Blooming Vales: repeatable 6-plant marker that becomes a greenery next to an ocean', () => {
    const corp = new BloomingVales();
    const [game, player] = withCorp(corp);
    expect(player.plants).eq(4);
    expect(player.production.plants).eq(1);
    expect(corp.canAct(player)).is.false;
    player.plants = 12;
    expect(corp.canAct(player)).is.true;

    const space = openSpace(game);
    player.actionsThisGeneration.add(corp.name);
    const select = cast(corp.action(player), SelectSpace);
    select.cb(space);
    runAllActions(game);
    expect(player.plants).eq(6);
    expect(space.player).eq(player);
    expect(space.tile).is.undefined;
    // Repeatable.
    expect(player.actionsThisGeneration.has(corp.name)).is.false;

    const oxygen = game.getOxygenLevel();
    const neighbour = game.board.getAdjacentSpaces(space)[0];
    game.addTile(player, neighbour, {tileType: TileType.OCEAN});
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.GREENERY);
    expect(space.player).eq(player);
    expect(game.getOxygenLevel()).eq(oxygen + 1);
    expect(corp.data.vales).is.empty;
  });

  it('Eletrop: energy production follows opponents; can\'t be raised; losses cost 2 energy', () => {
    const corp = new Eletrop();
    const [, player, other] = withCorp(corp);
    expect(player.production.energy).eq(0);
    other.production.add(Resource.ENERGY, 3);
    expect(player.production.energy).eq(3);
    player.production.add(Resource.ENERGY, 2);
    expect(player.production.energy).eq(3);

    expect(player.production.canAdjust({megacredits: 0, steel: 0, titanium: 0, plants: 0, energy: -1, heat: 0})).is.false;
    player.energy = 2;
    expect(player.production.canAdjust({megacredits: 0, steel: 0, titanium: 0, plants: 0, energy: -1, heat: 0})).is.true;
    player.production.add(Resource.ENERGY, -1);
    expect(player.energy).eq(0);
    expect(player.production.energy).eq(3);

    other.production.add(Resource.ENERGY, -1);
    expect(player.production.energy).eq(2);
  });

  it('Cold Fusion: setup, discounts, half energy kept, no energy production for milestones', () => {
    const [game0, before] = testGame(2);
    const tr = before.terraformRating;
    expect(game0).is.not.undefined;
    const corp = new ColdFusion();
    const [, player] = withCorp(corp);
    expect(player.terraformRating).eq(tr - 2);
    expect(player.production.energy).eq(10);
    expect(player.megaCredits).eq(20);

    expect(corp.getCardDiscount(player, new DomedCrater())).eq(4);
    expect(corp.getCardDiscount(player, new MagneticFieldGenerators())).eq(16);
    expect(corp.getCardDiscount(player, new Asteroid())).eq(0);

    expect(new Energizer().canClaim(player)).is.false;
    expect(player.production.energy).eq(10);

    player.energy = 5;
    expect(energyStorageCapacity(player)).eq(2);
  });
});
