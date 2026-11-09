import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, churn, runAllActions, setTemperature, setVenusScaleLevel} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {TileType} from '../../../src/common/TileType';
import {CardResource} from '../../../src/common/CardResource';
import {VenusPhase2Expansion} from '../../../src/server/venus2/VenusPhase2Expansion';
import {OvdaRegioMassDriver} from '../../../src/server/cards/venusphase2/OvdaRegioMassDriver';
import {AtmoSequester} from '../../../src/server/cards/venusphase2/AtmoSequester';
import {SolarWindTrap} from '../../../src/server/cards/venusphase2/SolarWindTrap';
import {VenusianInfrastructures} from '../../../src/server/cards/venusphase2/VenusianInfrastructures';
import {SyntheticBiology} from '../../../src/server/cards/venusphase2/SyntheticBiology';
import {BioWasteReactor} from '../../../src/server/cards/venusphase2/BioWasteReactor';
import {InSituResourceUtilization} from '../../../src/server/cards/venusphase2/InSituResourceUtilization';
import {ModularQuarters} from '../../../src/server/cards/venusphase2/ModularQuarters';
import {TransmissionTowers} from '../../../src/server/cards/venusphase2/TransmissionTowers';
import {HeatTrappersNetwork} from '../../../src/server/cards/venusphase2/HeatTrappersNetwork';
import {DysonHarropSatellite} from '../../../src/server/cards/venusphase2/DysonHarropSatellite';
import {CoolingPillars} from '../../../src/server/cards/venusphase2/CoolingPillars';
import {IonicThrustersSupport} from '../../../src/server/cards/venusphase2/IonicThrustersSupport';
import {NativeMicrofauna} from '../../../src/server/cards/venusphase2/NativeMicrofauna';
import {Menagerie} from '../../../src/server/cards/venusphase2/Menagerie';
import {ComputationalBiology} from '../../../src/server/cards/venusphase2/ComputationalBiology';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Birds} from '../../../src/server/cards/base/Birds';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {SmallDeposit} from '../../../src/server/cards/idesofmars/SmallDeposit';
import {SelectCard} from '../../../src/server/inputs/SelectCard';

let game: IGame;
let player: TestPlayer;
let other: TestPlayer;

function inputFrom(pi: unknown) {
  if (pi !== undefined) {
    return pi;
  }
  runAllActions(game);
  return player.popWaitingFor();
}

function placeOn(spaceId: 'v02' | 'v03' | 'v08') {
  runAllActions(game);
  cast(player.popWaitingFor(), SelectSpace).cb(VenusPhase2Expansion.board(game).getSpaceOrThrow(spaceId));
  runAllActions(game);
}

describe('Venus Phase 2 cards (50-67)', () => {
  beforeEach(() => {
    [game, player, other] = testGame(2, {venusNextExtension: true, venusPhase2Expansion: true, coloniesExtension: true});
  });

  it('Ovda Regio Mass Driver: 3 heat per Venus step you raise', () => {
    player.playedCards.push(new OvdaRegioMassDriver());
    game.increaseVenusScaleLevel(player, 2);
    expect(player.heat).eq(6);
    game.increaseVenusScaleLevel(other, 1);
    expect(player.heat).eq(6);
  });

  it('Atmo Sequester: 4 energy -> Venus + floater', () => {
    const card = new AtmoSequester();
    const dirigibles = new Dirigibles();
    player.playedCards.push(card, dirigibles);
    expect(card.canAct(player)).is.false;
    player.energy = 4;
    expect(card.canAct(player)).is.true;
    churn(card.action(player), player);
    expect(player.energy).eq(0);
    expect(game.getVenusScaleLevel()).eq(2);
    expect(dirigibles.resourceCount).eq(1);
  });

  it('Solar Wind Trap: add 2 ore, or 3 ore -> Venus', () => {
    const card = new SolarWindTrap();
    player.playedCards.push(card);
    const first = inputFrom(card.action(player));
    if (first instanceof OrOptions) {
      first.options[first.options.length - 1].cb();
    }
    runAllActions(game);
    expect(card.resourceCount).eq(2);
    card.resourceCount = 3;
    const or = cast(inputFrom(card.action(player)), OrOptions);
    or.options[0].cb();
    runAllActions(game);
    expect(card.resourceCount).eq(0);
    expect(game.getVenusScaleLevel()).eq(2);
  });

  it('Venusian Infrastructures: 1 ore from your cards -> 2 floaters here', () => {
    const card = new VenusianInfrastructures();
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 12);
    expect(card.canPlay(player)).is.true;
    const deposit = new SmallDeposit();
    player.playedCards.push(card, deposit);
    expect(card.canAct(player)).is.false;
    deposit.resourceCount = 1;
    expect(card.canAct(player)).is.true;
    churn(card.action(player), player);
    expect(deposit.resourceCount).eq(0);
    expect(card.resourceCount).eq(2);
    card.resourceCount = 5;
    expect(card.getVictoryPoints(player)).eq(2);
  });

  it('Synthetic Biology: 1 M€ per microbe you add', () => {
    const card = new SyntheticBiology();
    const tardigrades = new Tardigrades();
    player.playedCards.push(card, tardigrades);
    player.addResourceTo(tardigrades, 2);
    expect(player.megaCredits).eq(2);
  });

  it('Bio-Waste Reactor: 4 plants -> 2 microbes or 1 animal', () => {
    const card = new BioWasteReactor();
    const tardigrades = new Tardigrades();
    const birds = new Birds();
    player.playedCards.push(card, tardigrades, birds);
    player.plants = 4;
    const or = cast(inputFrom(card.action(player)), OrOptions);
    or.options[1].cb();
    runAllActions(game);
    expect(player.plants).eq(0);
    expect(birds.resourceCount).eq(1);
  });

  it('In-Situ Resource Utilization: 3 ore -> trade (uses a fleet)', () => {
    const card = new InSituResourceUtilization();
    const deposit = new SmallDeposit();
    deposit.resourceCount = 3;
    player.playedCards.push(card, deposit);
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectColony);
    select.cb(select.colonies[0]);
    runAllActions(game);
    expect(deposit.resourceCount).eq(0);
    expect(player.colonies.usedTradeFleets).eq(1);
  });

  it('Modular Quarters: raises Venus; 2 floaters when anyone places a Venus Habitat', () => {
    const card = new ModularQuarters();
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    player.playCard(card);
    runAllActions(game);
    expect(game.getVenusScaleLevel()).eq(2);
    VenusPhase2Expansion.addTile(other, 'v02', {tileType: TileType.VENUS_HABITAT});
    runAllActions(game);
    expect(dirigibles.resourceCount).eq(2);
    VenusPhase2Expansion.addTile(other, 'v03', {tileType: TileType.VENUS_FLOATING_ARRAY});
    runAllActions(game);
    expect(dirigibles.resourceCount).eq(2);
  });

  it('Transmission Towers: energy per own Floating Array; -1 M€ production', () => {
    const card = new TransmissionTowers();
    setVenusScaleLevel(game, 8);
    player.production.override({megacredits: 1});
    player.playCard(card);
    expect(player.production.megacredits).eq(0);
    expect(card.canAct(player)).is.false;
    VenusPhase2Expansion.addTile(player, 'v02', {tileType: TileType.VENUS_FLOATING_ARRAY});
    VenusPhase2Expansion.addTile(player, 'v03', {tileType: TileType.VENUS_FLOATING_ARRAY});
    player.energy = 0;
    card.action(player);
    expect(player.energy).eq(2);
  });

  it('Heat Trappers Network: 2 heat -> M€ per own Gas Mine', () => {
    const card = new HeatTrappersNetwork();
    player.production.override({energy: 1});
    player.playCard(card);
    expect(player.production.energy).eq(0);
    VenusPhase2Expansion.addTile(player, 'v01', {tileType: TileType.VENUS_GAS_MINE});
    VenusPhase2Expansion.addTile(player, 'v07', {tileType: TileType.VENUS_GAS_MINE});
    player.heat = 2;
    player.megaCredits = 0;
    expect(card.canAct(player)).is.true;
    churn(card.action(player), player);
    expect(player.heat).eq(0);
    expect(player.megaCredits).eq(2);
  });

  it('Dyson-Harrop Satellite: 2 science tags, +3 energy production', () => {
    const card = new DysonHarropSatellite();
    expect(card.canPlay(player)).is.false;
    player.tagsForTest = {science: 2};
    expect(card.canPlay(player)).is.true;
    player.playCard(card);
    expect(player.production.energy).eq(3);
  });

  it('Cooling Pillars: +1 energy production and a Floating Array', () => {
    player.playCard(new CoolingPillars());
    placeOn('v02');
    expect(player.production.energy).eq(1);
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_FLOATING_ARRAY)).eq(1);
    expect(game.getVenusScaleLevel()).eq(2);
  });

  it('Ionic Thrusters Support: 1 M€ production per 2 floaters of one opponent', () => {
    const dirigibles = new Dirigibles();
    dirigibles.resourceCount = 5;
    other.playedCards.push(dirigibles);
    player.playCard(new IonicThrustersSupport());
    expect(player.production.megacredits).eq(2);
  });

  it('Native Microfauna: max 16% Venus, 2 microbes, 2 VP', () => {
    const card = new NativeMicrofauna();
    setVenusScaleLevel(game, 18);
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 16);
    expect(card.canPlay(player)).is.true;
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    player.playCard(card);
    runAllActions(game);
    expect(tardigrades.resourceCount).eq(2);
  });

  it('Menagerie: on your greenery; M€ production and animals per adjacent greenery', () => {
    const card = new Menagerie();
    setTemperature(game, -10);
    expect(card.canPlay(player)).is.false;
    const center = addGreenery(player, '35');
    const neighbours = game.board.getAdjacentSpaces(center).filter((s) => s.tile === undefined && s.spaceType === 'land');
    addGreenery(player, neighbours[0].id);
    addGreenery(other, neighbours[1].id);
    expect(card.canPlay(player)).is.true;
    const birds = new Birds();
    player.playedCards.push(birds);
    const select = cast(card.play(player), SelectSpace);
    select.cb(center);
    runAllActions(game);
    expect(center.tile?.tileType).eq(TileType.MENAGERIE);
    expect(player.production.megacredits).eq(2);
    expect(birds.resourceCount).eq(2);
  });

  it('Computational Biology: 2 microbes and 2 data', () => {
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    player.playCard(new ComputationalBiology());
    runAllActions(game);
    expect(tardigrades.resourceCount).eq(2);
  });

  it('Venusian Infrastructures can take ore from a card when there is a choice', () => {
    const card = new VenusianInfrastructures();
    const a = new SmallDeposit();
    const b = new SolarWindTrap();
    a.resourceCount = 1;
    b.resourceCount = 1;
    player.playedCards.push(card, a, b);
    const select = churn(card.action(player), player);
    expect(select === undefined || select instanceof SelectCard).is.true;
    expect(CardResource.ORE).eq(a.resourceType);
  });
});
