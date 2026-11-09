import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addCity, churn, runAllActions, setOxygenLevel, setVenusScaleLevel} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectPayment} from '../../../src/server/inputs/SelectPayment';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {TileType} from '../../../src/common/TileType';
import {Tag} from '../../../src/common/cards/Tag';
import {CardName} from '../../../src/common/cards/CardName';
import {Payment} from '../../../src/common/inputs/Payment';
import {VenusPhase2Expansion} from '../../../src/server/venus2/VenusPhase2Expansion';
import {Outskirts} from '../../../src/server/cards/venusphase2/Outskirts';
import {PollutionControl} from '../../../src/server/cards/venusphase2/PollutionControl';
import {InterplanetaryRoutes} from '../../../src/server/cards/venusphase2/InterplanetaryRoutes';
import {ArgonMine} from '../../../src/server/cards/venusphase2/ArgonMine';
import {IshtarOrbitingAcademy} from '../../../src/server/cards/venusphase2/IshtarOrbitingAcademy';
import {HighPressureSuits} from '../../../src/server/cards/venusphase2/HighPressureSuits';
import {NewAlexandria} from '../../../src/server/cards/venusphase2/NewAlexandria';
import {GasTurbines} from '../../../src/server/cards/venusphase2/GasTurbines';
import {SurveyorsTeam} from '../../../src/server/cards/venusphase2/SurveyorsTeam';
import {VenusAircraftHaven} from '../../../src/server/cards/venusphase2/VenusAircraftHaven';
import {VenusKickstarting} from '../../../src/server/cards/venusphase2/VenusKickstarting';
import {FloaterFactory} from '../../../src/server/cards/venusphase2/FloaterFactory';
import {StarwindIITradeship} from '../../../src/server/cards/venusphase2/StarwindIITradeship';
import {SisterColonies} from '../../../src/server/cards/venusphase2/SisterColonies';
import {VenusianResearchCommittee} from '../../../src/server/cards/venusphase2/VenusianResearchCommittee';
import {CallistoDockingStation} from '../../../src/server/cards/venusphase2/CallistoDockingStation';
import {XenonMine} from '../../../src/server/cards/venusphase2/XenonMine';
import {RadonMine} from '../../../src/server/cards/venusphase2/RadonMine';
import {KryptonMine} from '../../../src/server/cards/venusphase2/KryptonMine';
import {NewAthens} from '../../../src/server/cards/venusphase2/NewAthens';
import {AlphaRegioIncubators} from '../../../src/server/cards/venusphase2/AlphaRegioIncubators';
import {NewRome} from '../../../src/server/cards/venusphase2/NewRome';
import {VenusTradeship} from '../../../src/server/cards/venusphase2/VenusTradeship';
import {VenusianWanderer} from '../../../src/server/cards/venusphase2/VenusianWanderer';
import {AphroditeShuttleBase} from '../../../src/server/cards/venusphase2/AphroditeShuttleBase';
import {IshtarEnergyNetwork} from '../../../src/server/cards/venusphase2/IshtarEnergyNetwork';
import {NewBabylon} from '../../../src/server/cards/venusphase2/NewBabylon';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {JovianLanterns} from '../../../src/server/cards/colonies/JovianLanterns';
import {Research} from '../../../src/server/cards/base/Research';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {fakeCard} from '../../TestingUtils';
import {Units} from '../../../src/common/Units';

let game: IGame;
let player: TestPlayer;
let other: TestPlayer;

function input(pi: unknown) {
  if (pi !== undefined) {
    return pi;
  }
  runAllActions(game);
  return player.popWaitingFor();
}

function placeFirst() {
  runAllActions(game);
  const select = cast(player.popWaitingFor(), SelectSpace);
  select.cb(select.spaces[0]);
  runAllActions(game);
  return select;
}

describe('Venus Phase 2 cards (68-96)', () => {
  beforeEach(() => {
    [game, player, other] = testGame(2, {venusNextExtension: true, venusPhase2Expansion: true, coloniesExtension: true, turmoilExtension: true});
  });

  it('Outskirts: city next to a city; that owner loses 1 energy production', () => {
    const card = new Outskirts();
    setOxygenLevel(game, 13);
    expect(card.canPlay(player)).is.false;
    const city = addCity(other, '35');
    other.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    expect(select.spaces.every((s) => game.board.getAdjacentSpaces(s).includes(city))).is.true;
    select.cb(select.spaces[0]);
    runAllActions(game);
    expect(other.production.energy).eq(0);
    expect(player.production.megacredits).eq(2);
  });

  it('Pollution Control: -2 M€ production, +2 TR', () => {
    const tr = player.terraformRating;
    player.production.override({megacredits: 2});
    player.playCard(new PollutionControl());
    expect(player.production.megacredits).eq(0);
    expect(player.terraformRating).eq(tr + 2);
  });

  it('Interplanetary Routes: +1 track on tiles with your colony', () => {
    const [a, b] = game.colonies;
    a.colonies.push(player.id);
    const posA = a.trackPosition;
    const posB = b.trackPosition;
    player.playCard(new InterplanetaryRoutes());
    expect(a.trackPosition).eq(posA + 1);
    expect(b.trackPosition).eq(posB);
  });

  it('Argon, Xenon, Radon and Krypton Mines place a Gas Mine and give production', () => {
    player.playCard(new ArgonMine());
    const select = placeFirst();
    expect(select.spaces).has.length(12);
    player.playCard(new XenonMine());
    placeFirst();
    player.playCard(new RadonMine());
    placeFirst();
    player.playCard(new KryptonMine());
    placeFirst();
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_GAS_MINE)).eq(4);
    expect(player.production.asUnits()).deep.eq(Units.of({heat: 8, megacredits: 8, energy: 1}));
    expect(game.getVenusScaleLevel()).eq(8);
  });

  it('Ishtar Orbiting Academy: 2 M€ per science tag you play', () => {
    player.playedCards.push(new IshtarOrbitingAcademy());
    player.playCard(new Research());
    expect(player.megaCredits).eq(4);
  });

  it('High Pressure Suits: at most 2 Jovian tags', () => {
    const card = new HighPressureSuits();
    player.tagsForTest = {jovian: 2};
    expect(card.canPlay(player)).is.true;
    player.tagsForTest = {jovian: 3};
    expect(card.canPlay(player)).is.false;
  });

  it('New Alexandria, New Athens, New Babylon place a Venus Habitat', () => {
    setVenusScaleLevel(game, 12);
    player.production.override({energy: 1});
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    player.playCard(new NewAlexandria());
    placeFirst();
    player.playCard(new NewAthens());
    runAllActions(game);
    // Floaters go on Dirigibles automatically; the science resource has no card to go on.
    placeFirst();
    player.playCard(new NewBabylon());
    placeFirst();
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_HABITAT)).eq(3);
    expect(player.production.megacredits).eq(3);
    expect(player.production.plants).eq(2);
    expect(dirigibles.resourceCount).eq(2);
    // Habitats are not cities.
    expect(game.board.getCities(player)).is.empty;
  });

  it('Gas Turbines: 1 energy production per 10% Venus', () => {
    setVenusScaleLevel(game, 24);
    player.playCard(new GasTurbines());
    expect(player.production.energy).eq(2);
  });

  it('Surveyors Team keeps cards with planetary tags', () => {
    const card = new SurveyorsTeam();
    const keep = fakeCard({name: 'keep' as CardName, tags: [Tag.EARTH]});
    const toss = fakeCard({name: 'toss' as CardName, tags: [Tag.SCIENCE]});
    game.projectDeck.drawPile.push(toss, keep);
    card.action(player);
    expect(player.cardsInHand).deep.eq([keep]);
    card.action(player);
    expect(player.cardsInHand).deep.eq([keep]);
    expect(game.projectDeck.discardPile).includes(toss);
  });

  it('Venus Aircraft Haven: 2 floaters; add 1, or 3 -> Venus', () => {
    const card = new VenusAircraftHaven();
    setVenusScaleLevel(game, 6);
    player.playCard(card);
    runAllActions(game);
    expect(card.resourceCount).eq(2);
    card.resourceCount = 3;
    const or = cast(input(card.action(player)), OrOptions);
    or.options[0].cb();
    runAllActions(game);
    expect(card.resourceCount).eq(0);
    expect(game.getVenusScaleLevel()).eq(8);
  });

  it('Venus Kickstarting: max 16% Venus, 2 Floating Arrays', () => {
    const card = new VenusKickstarting();
    setVenusScaleLevel(game, 18);
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 10);
    expect(card.canPlay(player)).is.true;
    player.playCard(card);
    placeFirst();
    placeFirst();
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_FLOATING_ARRAY)).eq(2);
    expect(game.getVenusScaleLevel()).eq(14);
  });

  it('Floater Factory: heat -> floater; +1 heat production', () => {
    const card = new FloaterFactory();
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    player.playCard(card);
    expect(player.production.heat).eq(1);
    player.heat = 1;
    churn(card.action(player), player);
    expect(player.heat).eq(0);
    expect(dirigibles.resourceCount).eq(1);
  });

  it('Starwind II Tradeship: gain a fleet; 3 heat -> trade', () => {
    const card = new StarwindIITradeship();
    const fleets = player.colonies.getFleetSize();
    player.playCard(card);
    expect(player.colonies.getFleetSize()).eq(fleets + 1);
    player.heat = 3;
    expect(card.canAct(player)).is.true;
    const select = cast(card.action(player), SelectColony);
    expect(player.heat).eq(0);
    select.cb(select.colonies[0]);
    runAllActions(game);
    expect(player.colonies.usedTradeFleets).eq(1);
  });

  it('Sister Colonies: 2 colonies on 2 different tiles', () => {
    const card = new SisterColonies();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    const first = cast(player.popWaitingFor(), SelectColony);
    const tile = first.colonies[0];
    first.cb(tile);
    runAllActions(game);
    const second = cast(player.popWaitingFor(), SelectColony);
    expect(second.colonies).does.not.include(tile);
    second.cb(second.colonies[0]);
    runAllActions(game);
    expect(player.getColoniesCount()).eq(2);
  });

  it('Venusian Research Committee: a card per 2 Venus tags, raise Venus', () => {
    player.tagsForTest = {venus: 4};
    player.playCard(new VenusianResearchCommittee());
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(game.getVenusScaleLevel()).eq(2);
  });

  it('Callisto Docking Station: +1 M€ and +1 titanium production', () => {
    player.playCard(new CallistoDockingStation());
    expect(player.production.megacredits).eq(1);
    expect(player.production.titanium).eq(1);
  });

  it('Alpha Regio Incubators: a microbe per Venus tag, including itself', () => {
    const card = new AlphaRegioIncubators();
    player.playCard(card);
    placeFirst();
    expect(card.resourceCount).eq(1);
    player.playCard(new NewBabylon());
    expect(card.resourceCount).eq(2);
  });

  it('New Rome: add a delegate to a party you lead', () => {
    const card = new NewRome();
    setVenusScaleLevel(game, 16);
    player.playCard(card);
    placeFirst();
    expect(card.canAct(player)).is.false;
    const turmoil = Turmoil.getTurmoil(game);
    turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
    turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
    expect(card.canAct(player)).is.true;
    const before = turmoil.getPartyByName(PartyName.GREENS).delegates.get(player);
    card.action(player);
    expect(turmoil.getPartyByName(PartyName.GREENS).delegates.get(player)).eq(before + 1);
  });

  it('Venus Tradeship: pay 2 M€ per chosen floater card', () => {
    const card = new VenusTradeship();
    expect(card.canPlay(player)).is.false;
    const dirigibles = new Dirigibles();
    const haven = new VenusAircraftHaven();
    player.playedCards.push(dirigibles, haven);
    player.megaCredits = 10;
    expect(card.canPlay(player)).is.true;
    const select = cast(card.play(player), SelectCard);
    select.cb([dirigibles, haven]);
    runAllActions(game);
    const pay = player.popWaitingFor();
    if (pay instanceof SelectPayment) {
      pay.cb(Payment.of({megacredits: 4}));
      runAllActions(game);
    }
    expect(player.megaCredits).eq(6);
    expect(dirigibles.resourceCount).eq(1);
    expect(haven.resourceCount).eq(1);
  });

  it('Venusian Wanderer: a floater per Venus tag played after it', () => {
    const card = new VenusianWanderer();
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    setVenusScaleLevel(game, 4);
    player.playCard(card);
    runAllActions(game);
    expect(dirigibles.resourceCount).eq(0);
    player.playCard(new NewBabylon());
    // Place the habitat, then pick one of the two floater cards.
    placeFirst();
    const pick = cast(player.popWaitingFor(), SelectCard);
    pick.cb([dirigibles]);
    runAllActions(game);
    expect(dirigibles.resourceCount).eq(1);
  });

  it('Aphrodite Shuttle Base: Floating Array, 3 floaters to a Jovian card', () => {
    const lanterns = new JovianLanterns();
    player.playedCards.push(lanterns, new Dirigibles());
    player.playCard(new AphroditeShuttleBase());
    runAllActions(game);
    placeFirst();
    expect(lanterns.resourceCount).eq(3);
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_FLOATING_ARRAY)).eq(1);
  });

  it('Ishtar Energy Network: Floating Array and a floater', () => {
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    player.playCard(new IshtarEnergyNetwork());
    runAllActions(game);
    placeFirst();
    expect(dirigibles.resourceCount).eq(1);
    expect(game.getVenusScaleLevel()).eq(2);
  });

  it('a Venus tile card can\'t be played with no space left', () => {
    const board = VenusPhase2Expansion.board(game);
    for (const space of board.getAvailableSpacesForGasMine(player)) {
      VenusPhase2Expansion.addTile(other, space.id, {tileType: TileType.VENUS_GAS_MINE});
    }
    expect(new ArgonMine().canPlay(player)).is.false;
    expect(new IshtarEnergyNetwork().canPlay(player)).is.true;
    const tardigrades = new Tardigrades();
    expect(tardigrades.name).eq(CardName.TARDIGRADES);
  });
});
