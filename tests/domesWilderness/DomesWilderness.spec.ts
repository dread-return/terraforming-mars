import {expect} from 'chai';
import {testGame} from '../TestGame';
import {cast, toName} from '../../src/common/utils/utils';
import {addCity, addGreenery, runAllActions} from '../TestingUtils';
import {IGame} from '../../src/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {Payment} from '../../src/common/inputs/Payment';
import {CardName} from '../../src/common/cards/CardName';
import {TileType} from '../../src/common/TileType';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {SelectSpace} from '../../src/server/inputs/SelectSpace';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {Space} from '../../src/server/boards/Space';
import {IStandardProjectCard} from '../../src/server/cards/IStandardProjectCard';
import {DomesWilderness} from '../../src/server/domesWilderness/DomesWilderness';
import {PlaceCityTile} from '../../src/server/deferredActions/PlaceCityTile';
import {PlaceGreeneryTile} from '../../src/server/deferredActions/PlaceGreeneryTile';
import {ConvertPlants} from '../../src/server/cards/base/standardActions/ConvertPlants';
import {Mayor} from '../../src/server/milestones/Mayor';
import {Gardener} from '../../src/server/milestones/Gardener';
import {RoverConstruction} from '../../src/server/cards/base/RoverConstruction';
import {Herbivores} from '../../src/server/cards/base/Herbivores';
import {Tardigrades} from '../../src/server/cards/base/Tardigrades';
import {Fish} from '../../src/server/cards/base/Fish';
import {AresHandler} from '../../src/server/ares/AresHandler';
import {AresHazards} from '../../src/server/ares/AresHazards';
import {calculateVictoryPoints} from '../../src/server/game/calculateVictoryPoints';

function project(game: IGame, name: CardName): IStandardProjectCard {
  const card = game.standardProjects.find((c) => c.name === name);
  if (card === undefined) {
    throw new Error('missing ' + name);
  }
  return card;
}

/** Buys the standard project and answers the space prompt with `space`. */
function buy(game: IGame, player: TestPlayer, name: CardName, space: Space): void {
  const card = project(game, name);
  player.megaCredits = 100;
  card.payAndExecute(player, Payment.of({megacredits: card.cost}));
  runAllActions(game);
  cast(player.popWaitingFor(), SelectSpace).cb(space);
  runAllActions(game);
}

describe('Domes and Wilderness', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {domesWilderness: true});
  });

  it('adds the standard projects only when the option is on', () => {
    const names = game.standardProjects.map(toName);
    expect(names).includes(CardName.DOME_STANDARD_PROJECT);
    expect(names).includes(CardName.WILDERNESS_STANDARD_PROJECT);
    const [plain] = testGame(2);
    expect(plain.standardProjects.map(toName)).does.not.include(CardName.DOME_STANDARD_PROJECT);
    expect(plain.standardProjects.map(toName)).does.not.include(CardName.WILDERNESS_STANDARD_PROJECT);
  });

  it('costs 20 M€ for a dome and 23 M€ for a wilderness', () => {
    expect(project(game, CardName.DOME_STANDARD_PROJECT).cost).eq(20);
    expect(project(game, CardName.WILDERNESS_STANDARD_PROJECT).cost).eq(23);
  });

  describe('Dome', () => {
    it('needs one of your cities on Mars', () => {
      const dome = project(game, CardName.DOME_STANDARD_PROJECT);
      player.megaCredits = 100;
      expect(dome.canAct(player)).is.false;

      addCity(player2);
      expect(dome.canAct(player)).is.false;

      addCity(player);
      expect(dome.canAct(player)).is.true;
    });

    it('cannot go on a city in space', () => {
      const colony = game.board.spaces.find((space) => space.spaceType === SpaceType.COLONY)!;
      game.simpleAddTile(player, colony, {tileType: TileType.CITY});
      expect(game.board.getCities(player)).deep.eq([colony]);
      expect(DomesWilderness.upgradeableCities(player)).is.empty;
    });

    it('raises M€, plant and heat production and covers the city', () => {
      const city = addCity(player);
      runAllActions(game);
      buy(game, player, CardName.DOME_STANDARD_PROJECT, city);

      expect(city.tile?.tileType).eq(TileType.CITY);
      expect(city.tile?.upgrade).eq('dome');
      expect(player.production.megacredits).eq(1);
      expect(player.production.plants).eq(1);
      expect(player.production.heat).eq(1);
      expect(player.megaCredits).eq(80);
    });

    it('is offered only your own cities without a dome', () => {
      const mine = addCity(player);
      const theirs = addCity(player2);
      expect(DomesWilderness.upgradeableCities(player)).deep.eq([mine]);
      mine.tile!.upgrade = 'dome';
      expect(DomesWilderness.upgradeableCities(player)).is.empty;
      expect(DomesWilderness.upgradeableCities(player2)).deep.eq([theirs]);
    });

    it('counts as placing a city', () => {
      const city = addCity(player);
      runAllActions(game);
      player.playedCards.push(new RoverConstruction());
      player.megaCredits = 0;

      buy(game, player, CardName.DOME_STANDARD_PROJECT, city);

      expect(player.megaCredits).eq(100 - 20 + 2);
    });

    it('counts as two cities for cards and effects, but one for scoring', () => {
      const city = addCity(player);
      addGreenery(player, game.board.getAdjacentSpaces(city).find((space) => space.tile === undefined)!.id);
      runAllActions(game);
      const mayor = new Mayor();
      expect(mayor.getScore(player)).eq(1);
      const before = calculateVictoryPoints(player);

      buy(game, player, CardName.DOME_STANDARD_PROJECT, city);

      expect(mayor.getScore(player)).eq(2);
      expect(game.board.getCities(player)).has.length(1);
      const after = calculateVictoryPoints(player);
      expect(after.city).eq(before.city);
      expect(after.greenery).eq(before.greenery);
    });
  });

  describe('Wilderness', () => {
    it('needs one of your greeneries', () => {
      const wilderness = project(game, CardName.WILDERNESS_STANDARD_PROJECT);
      player.megaCredits = 100;
      expect(wilderness.canAct(player)).is.false;

      addGreenery(player2);
      expect(wilderness.canAct(player)).is.false;

      addGreenery(player);
      expect(wilderness.canAct(player)).is.true;
    });

    it('raises TR and gives a plant, a microbe and an animal', () => {
      const tardigrades = new Tardigrades();
      const fish = new Fish();
      player.playedCards.push(tardigrades, fish);
      const greenery = addGreenery(player);
      runAllActions(game);
      const tr = player.terraformRating;
      const oxygen = game.getOxygenLevel();

      buy(game, player, CardName.WILDERNESS_STANDARD_PROJECT, greenery);

      expect(greenery.tile?.tileType).eq(TileType.GREENERY);
      expect(greenery.tile?.upgrade).eq('wilderness');
      expect(player.terraformRating).eq(tr + 1);
      expect(game.getOxygenLevel()).eq(oxygen);
      expect(player.plants).eq(1);
      expect(tardigrades.resourceCount).eq(1);
      expect(fish.resourceCount).eq(1);
      expect(player.megaCredits).eq(77);
    });

    it('counts as placing a greenery', () => {
      const herbivores = new Herbivores();
      player.playedCards.push(herbivores);
      const greenery = addGreenery(player);
      runAllActions(game);
      const animals = herbivores.resourceCount;

      buy(game, player, CardName.WILDERNESS_STANDARD_PROJECT, greenery);

      // One animal for the greenery, one more from the wilderness itself.
      expect(herbivores.resourceCount).eq(animals + 2);
    });

    it('counts as two greeneries for cards and effects, but one for scoring', () => {
      const greenery = addGreenery(player);
      runAllActions(game);
      const gardener = new Gardener();
      expect(gardener.getScore(player)).eq(1);
      const before = calculateVictoryPoints(player);

      buy(game, player, CardName.WILDERNESS_STANDARD_PROJECT, greenery);

      expect(gardener.getScore(player)).eq(2);
      expect(calculateVictoryPoints(player).greenery).eq(before.greenery);
    });
  });

  describe('Alternative placing', () => {
    it('offers a dome when a city is placed', () => {
      const city = addCity(player);
      runAllActions(game);

      game.defer(new PlaceCityTile(player));
      runAllActions(game);
      const options = cast(player.popWaitingFor(), OrOptions);
      const [place, instead] = options.options.map((o) => cast(o, SelectSpace));
      expect(instead.spaces).deep.eq([city]);
      expect(place.spaces).does.not.include(city);

      instead.cb(city);
      runAllActions(game);
      expect(city.tile?.upgrade).eq('dome');
      expect(player.production.megacredits).eq(1);
      expect(player.production.plants).eq(1);
      expect(player.production.heat).eq(1);
      expect(game.board.getCities()).has.length(1);
    });

    it('offers a wilderness when a greenery is placed, without raising oxygen', () => {
      const greenery = addGreenery(player);
      runAllActions(game);
      const oxygen = game.getOxygenLevel();

      game.defer(new PlaceGreeneryTile(player));
      runAllActions(game);
      const options = cast(player.popWaitingFor(), OrOptions);
      cast(options.options[1], SelectSpace).cb(greenery);
      runAllActions(game);

      expect(greenery.tile?.upgrade).eq('wilderness');
      expect(game.getOxygenLevel()).eq(oxygen);
    });

    it('tells the placing effect which space was used', () => {
      const city = addCity(player);
      runAllActions(game);
      let placed: Space | undefined;

      game.defer(new PlaceCityTile(player)).andThen((space) => {
        placed = space;
      });
      runAllActions(game);
      cast(cast(player.popWaitingFor(), OrOptions).options[1], SelectSpace).cb(city);
      runAllActions(game);

      expect(placed).eq(city);
    });

    it('is not offered when you have nothing to upgrade', () => {
      game.defer(new PlaceCityTile(player));
      runAllActions(game);
      cast(player.popWaitingFor(), SelectSpace);
    });

    it('is not offered when the option is off', () => {
      const [plainGame, plain] = testGame(2);
      addCity(plain);
      runAllActions(plainGame);
      plainGame.defer(new PlaceCityTile(plain));
      runAllActions(plainGame);
      cast(plain.popWaitingFor(), SelectSpace);
    });

    it('is not offered when a card limits the spaces', () => {
      const city = addCity(player);
      runAllActions(game);
      const spaces = game.board.getAvailableSpacesOnLand(player).slice(0, 2);

      game.defer(new PlaceCityTile(player, {spaces}));
      runAllActions(game);
      const select = cast(player.popWaitingFor(), SelectSpace);
      expect(select.spaces).does.not.include(city);
    });

    it('only upgrades cities that are not already upgraded', () => {
      const city = addCity(player);
      city.tile!.upgrade = 'dome';
      runAllActions(game);
      game.defer(new PlaceCityTile(player));
      runAllActions(game);
      cast(player.popWaitingFor(), SelectSpace);
    });

    it('lets plant conversion upgrade a greenery to a wilderness', () => {
      const greenery = addGreenery(player);
      runAllActions(game);
      const oxygen = game.getOxygenLevel();
      const tr = player.terraformRating;
      player.plants = 9;

      const convert = new ConvertPlants();
      expect(convert.canAct(player)).is.true;
      const options = cast(convert.action(player), OrOptions);
      cast(options.options[1], SelectSpace).cb(greenery);
      runAllActions(game);

      expect(greenery.tile?.upgrade).eq('wilderness');
      expect(player.plants).eq(9 - 8 + 1);
      expect(player.terraformRating).eq(tr + 1);
      expect(game.getOxygenLevel()).eq(oxygen);
    });

    it('lets plant conversion upgrade even when every area is taken', () => {
      const greenery = addGreenery(player);
      for (const space of game.board.getAvailableSpacesOnLand(player)) {
        game.simpleAddTile(player2, space, {tileType: TileType.GREENERY});
      }
      runAllActions(game);
      player.plants = 8;

      const convert = new ConvertPlants();
      expect(convert.canAct(player)).is.true;
      const select = cast(convert.action(player), SelectSpace);
      expect(select.spaces).deep.eq([greenery]);
    });

    it('leaves plant conversion alone without the option', () => {
      const [plainGame, plain] = testGame(2);
      addGreenery(plain);
      runAllActions(plainGame);
      plain.plants = 8;
      cast(new ConvertPlants().action(plain), SelectSpace);
    });
  });

  describe('hazards (Ares)', () => {
    let aresGame: IGame;
    let ares: TestPlayer;

    beforeEach(() => {
      [aresGame, ares] = testGame(2, {domesWilderness: true, aresExtension: true, aresHazards: false});
    });

    function hazardNextTo(space: Space): Space {
      const hazard = aresGame.board.getAdjacentSpaces(space).find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND)!;
      AresHazards.putHazardAt(aresGame, hazard, TileType.DUST_STORM_MILD);
      return hazard;
    }

    it('costs production next to a hazard without a dome', () => {
      const city = addCity(ares);
      const hazard = hazardNextTo(city);
      const target = aresGame.board.getAdjacentSpaces(hazard).find((s) => s.tile === undefined && !aresGame.board.getAdjacentSpaces(s).includes(city))!;

      const cost = AresHandler.computePlacementCosts(ares, aresGame.board, target, true);
      expect(cost.production.mild).eq(1);
    });

    it('protects tiles placed next to one of your domes', () => {
      const city = addCity(ares);
      city.tile!.upgrade = 'dome';
      const hazard = hazardNextTo(city);
      const target = aresGame.board.getAdjacentSpaces(hazard).find((s) => s.tile === undefined && aresGame.board.getAdjacentSpaces(s).includes(city))!;

      const cost = AresHandler.computePlacementCosts(ares, aresGame.board, target, true);
      expect(cost.production.mild).eq(0);
    });

    it('does not protect tiles next to a dome of another player', () => {
      const city = addCity(aresGame.players[1]);
      city.tile!.upgrade = 'dome';
      const hazard = hazardNextTo(city);
      const target = aresGame.board.getAdjacentSpaces(hazard).find((s) => s.tile === undefined && aresGame.board.getAdjacentSpaces(s).includes(city))!;

      const cost = AresHandler.computePlacementCosts(ares, aresGame.board, target, true);
      expect(cost.production.mild).eq(1);
    });
  });

  it('keeps the upgrade when the game is saved and loaded', () => {
    const city = addCity(player);
    city.tile!.upgrade = 'dome';
    const serialized = game.serialize();
    const space = serialized.board.spaces.find((s) => s.id === city.id)!;
    expect(space.tile?.upgrade).eq('dome');
  });
});
