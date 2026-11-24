import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Game} from '../../../src/server/Game';
import {CardName} from '../../../src/common/cards/CardName';
import {Phase} from '../../../src/common/Phase';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectPayment} from '../../../src/server/inputs/SelectPayment';
import {Payment} from '../../../src/common/inputs/Payment';
import {Board} from '../../../src/server/boards/Board';
import {FoundingFarmers} from '../../../src/server/cards/epic/FoundingFarmers';
import {MarsNomadsEpic} from '../../../src/server/cards/epic/MarsNomadsEpic';
import {OrwellObservatories} from '../../../src/server/cards/epic/OrwellObservatories';
import {OmniDroneLabs} from '../../../src/server/cards/epic/OmniDroneLabs';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 8 (custom tiles)', () => {
  it('OmniDrone Labs counts its own science tag', () => {
    const corp = new OmniDroneLabs();
    withCorp(corp);
    expect(corp.resourceCount).eq(1);
  });

  it('Founding Farmers: 6 plants place a farm and raise oxygen; farms score 1 VP + 1 per adjacent city', () => {
    const corp = new FoundingFarmers();
    const [game, player, other] = withCorp(corp);
    expect(player.plants).eq(3);
    expect(player.production.plants).eq(1);
    expect(corp.resourceCount).eq(3);
    expect(corp.canAct(player)).is.false;

    player.plants = 6;
    const select = cast(corp.action(player), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.FARM);
    expect(space.player).eq(player);
    expect(game.getOxygenLevel()).eq(1);
    expect(player.plants).eq(0);
    expect(corp.resourceCount).eq(2);
    expect(corp.getVictoryPoints(player)).eq(1);

    // A city next to it (anyone's) adds 1 VP.
    const next = game.board.getAdjacentSpaces(space).find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND)!;
    game.simpleAddTile(other, next, {tileType: TileType.CITY});
    expect(corp.getVictoryPoints(player)).eq(2);
  });

  it('Mars Nomads (Epic): the Nomad city counts as a city and moves up to 2 spaces', () => {
    const corp = new MarsNomadsEpic();
    const [game, player] = withCorp(corp);
    const place = cast(corp.initialAction(player), SelectSpace);
    const start = place.spaces[0];
    place.cb(start);
    runAllActions(game);
    expect(start.tile?.tileType).eq(TileType.NOMAD_CITY);
    expect(game.board.getCities(player)).deep.eq([start]);

    player.megaCredits = 0;
    player.steel = 1;
    expect(corp.canAct(player)).is.true;
    const destinations = corp.destinations(player);
    expect(destinations.length).is.greaterThan(0);
    for (const d of destinations) {
      const near = game.board.getAdjacentSpaces(start).includes(d) ||
        game.board.getAdjacentSpaces(start).some((s) => game.board.getAdjacentSpaces(s).includes(d));
      expect(near, d.id).is.true;
    }
    const to = destinations[0];
    to.bonus = [SpaceBonus.STEEL, SpaceBonus.STEEL];
    const select = cast(corp.action(player), SelectSpace);
    select.cb(to);
    expect(player.steel).eq(2);
    expect(start.tile).is.undefined;
    expect(start.player).is.undefined;
    expect(to.tile?.tileType).eq(TileType.NOMAD_CITY);
    expect(game.board.getCities(player)).deep.eq([to]);
  });

  it('Mars Nomads (Epic): 3 M€ per ocean next to the new space; choose how to pay', () => {
    const corp = new MarsNomadsEpic();
    const [game, player] = withCorp(corp);
    cast(corp.initialAction(player), SelectSpace).cb(game.board.getAvailableSpacesForCity(player)[0]);
    runAllActions(game);
    const to = corp.destinations(player)[0];
    to.bonus = [];
    const ocean = game.board.getAdjacentSpaces(to).find((s) => s.tile === undefined && s.id !== to.id)!;
    ocean.tile = {tileType: TileType.OCEAN};
    player.steel = 1;
    player.megaCredits = 2;
    const options = cast(corp.action(player), OrOptions);
    cast(options.options[1].cb(undefined), SelectSpace).cb(to);
    expect(player.megaCredits).eq(3);
    expect(player.steel).eq(1);
  });

  it('Orwell Observatories: observatory cities orbit Mars, count as cities and survive a reload', () => {
    const corp = new OrwellObservatories();
    const [game, player] = withCorp(corp);
    const hand = player.cardsInHand.length;
    const select = cast(corp.initialAction(player), SelectSpace);
    expect(player.cardsInHand.length).eq(hand + 1);
    expect(select.spaces.every((s) => s.edge && s.spaceType === SpaceType.LAND)).is.true;
    const anchor = select.spaces[0];
    anchor.bonus = [SpaceBonus.TITANIUM];
    select.cb(anchor);
    runAllActions(game);

    expect(player.titanium).eq(1);
    expect(anchor.tile).is.undefined;
    const cities = game.board.getCities(player);
    expect(cities).has.length(1);
    expect(cities[0].spaceType).eq(SpaceType.COLONY);
    expect(cities[0].tile?.tileType).eq(TileType.OBSERVATORY_CITY);
    expect(game.board.getCitiesOffMars(player)).has.length(1);
    // That edge hex can't take another observatory city.
    expect(corp.freeEdgeSpaces(player)).not.contains(anchor);

    const copy = Game.deserialize(game.serialize());
    const restored = copy.board.getSpaceOrThrow(cities[0].id);
    expect(restored.tile?.tileType).eq(TileType.OBSERVATORY_CITY);
    expect(copy.board.getCities()).has.length(1);
  });

  it('Orwell Observatories: no city standard project; the action costs 20 M€ (titanium ok)', () => {
    const corp = new OrwellObservatories();
    const [game, player] = withCorp(corp);
    player.megaCredits = 100;
    expect(new CityStandardProject().canAct(player)).is.false;

    player.megaCredits = 11;
    player.titanium = 3;
    expect(corp.canAct(player)).is.true;
    corp.action(player);
    const payment = cast(game.deferredActions.pop()!.execute(), SelectPayment);
    payment.process({type: 'payment', payment: Payment.of({megacredits: 11, titanium: 3})}, player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(corp.freeEdgeSpaces(player)[0]);
    expect(player.production.megacredits).eq(2);
    expect(game.board.getCities(player)).has.length(1);
  });

  it('Orwell Observatories: a rival tile by an observatory city reveals negative-VP cards to take', () => {
    const corp = new OrwellObservatories();
    const [game, player, other] = withCorp(corp);
    const select = cast(corp.initialAction(player), SelectSpace);
    const anchor = select.spaces[0];
    select.cb(anchor);
    runAllActions(game);

    const bad = fakeCard({name: 'bad' as CardName, victoryPoints: -1});
    other.cardsInHand = [bad];
    const next = game.board.getAdjacentSpaces(anchor).find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND)!;
    game.addTile(other, next, {tileType: TileType.GREENERY});
    runAllActions(game);
    const take = cast(player.popWaitingFor(), SelectCard);
    expect(take.cards).deep.eq([bad]);
    take.cb([bad]);
    expect(other.cardsInHand).is.empty;
    expect(player.cardsInHand).contains(bad);

    // Far away: nothing happens.
    const far = game.board.getAvailableSpacesOnLand(other).find((s) =>
      s.id !== anchor.id && !game.board.getAdjacentSpaces(s).includes(anchor))!;
    other.cardsInHand = [fakeCard({name: 'bad2' as CardName, victoryPoints: -2})];
    game.addTile(other, far, {tileType: TileType.GREENERY});
    runAllActions(game);
    expect(player.getWaitingFor()).is.undefined;
    expect(Board.isCitySpace(anchor)).is.false;
  });
});
