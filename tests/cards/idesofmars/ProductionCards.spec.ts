import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addCity, addGreenery, maxOutOceans, runAllActions, setOxygenLevel, setTemperature, setVenusScaleLevel} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {Tag} from '../../../src/common/cards/Tag';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {Resource} from '../../../src/common/Resource';
import {BudgetRestrictions} from '../../../src/server/cards/idesofmars/BudgetRestrictions';
import {PreciousMetalAsteroid} from '../../../src/server/cards/idesofmars/PreciousMetalAsteroid';
import {ScienceFair} from '../../../src/server/cards/idesofmars/ScienceFair';
import {MuseumOfTerraformation} from '../../../src/server/cards/idesofmars/MuseumOfTerraformation';
import {PlotContamination} from '../../../src/server/cards/idesofmars/PlotContamination';
import {ThreePlanetsSystem} from '../../../src/server/cards/idesofmars/ThreePlanetsSystem';
import {CorporateAcquisition} from '../../../src/server/cards/idesofmars/CorporateAcquisition';
import {InvestmentInsurance} from '../../../src/server/cards/idesofmars/InvestmentInsurance';
import {DragonStorm} from '../../../src/server/cards/idesofmars/DragonStorm';
import {GalileianTourism} from '../../../src/server/cards/idesofmars/GalileianTourism';
import {VenusianGroundLaboratory} from '../../../src/server/cards/idesofmars/VenusianGroundLaboratory';
import {MercurialLaboratory} from '../../../src/server/cards/idesofmars/MercurialLaboratory';
import {DarkVegetation} from '../../../src/server/cards/idesofmars/DarkVegetation';
import {DerivedProducts} from '../../../src/server/cards/idesofmars/DerivedProducts';
import {FloatingRig} from '../../../src/server/cards/idesofmars/FloatingRig';
import {EnergyShortcut} from '../../../src/server/cards/idesofmars/EnergyShortcut';
import {OverconsumptionBenefits} from '../../../src/server/cards/idesofmars/OverconsumptionBenefits';
import {Infrastructures} from '../../../src/server/cards/idesofmars/Infrastructures';
import {Reptiles} from '../../../src/server/cards/idesofmars/Reptiles';
import {ObjectiveMars} from '../../../src/server/cards/idesofmars/ObjectiveMars';
import {Slum} from '../../../src/server/cards/idesofmars/Slum';
import {BioBatteries} from '../../../src/server/cards/idesofmars/BioBatteries';
import {PleistoceneMegafauna} from '../../../src/server/cards/idesofmars/PleistoceneMegafauna';
import {SmallDeposit} from '../../../src/server/cards/idesofmars/SmallDeposit';
import {BudgetManagement} from '../../../src/server/cards/idesofmars/BudgetManagement';
import {PatentPooling} from '../../../src/server/cards/idesofmars/PatentPooling';
import {MartianHour} from '../../../src/server/cards/idesofmars/MartianHour';
import {FloatingBaseOnSaturn} from '../../../src/server/cards/idesofmars/FloatingBaseOnSaturn';

describe('Ides of Mars production and simple cards', () => {
  it('Budget Restrictions: buy at most 3 cards in the research phase', () => {
    const card = new BudgetRestrictions();
    const [game, player] = testGame(2);
    card.play(player);
    expect(player.production.megacredits).eq(3);
    player.playedCards.push(card);
    player.megaCredits = 20;
    player.draftedCards = game.projectDeck.drawN(game, 4);
    player.runResearchPhase();
    const input = player.getWaitingFor()?.toModel(player);
    expect(input).has.property('max', 3);
  });

  it('Precious Metal Asteroid: temperature, 5 M€, 3 silver cubes, removes plants', () => {
    const card = new PreciousMetalAsteroid();
    const [game, player, opponent] = testGame(2);
    opponent.plants = 5;
    card.play(player);
    runAllActions(game);
    expect(game.getTemperature()).eq(-28);
    expect(player.megaCredits).eq(5);
    for (let i = 0; i < 3; i++) {
      const select = cast(player.popWaitingFor(), SelectSpace);
      expect(select.spaces.every((s) => s.spaceType === SpaceType.LAND)).is.true;
      select.cb(select.spaces[0]);
      runAllActions(game);
    }
    expect(game.board.spaces.filter((s) => s.bonus.includes(SpaceBonus.INCENTIVE_5MC))).has.length(3);
  });

  it('Science Fair: draw 2, others draw 1', () => {
    const card = new ScienceFair();
    const [game, player, opponent] = testGame(2);
    card.play(player);
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(opponent.cardsInHand).has.length(1);
  });

  it('Museum of Terraformation: 1 TR per maxed parameter', () => {
    const card = new MuseumOfTerraformation();
    const [game, player] = testGame(2, {venusNextExtension: true});
    setTemperature(game, 8);
    setOxygenLevel(game, 14);
    const tr = player.terraformRating;
    card.play(player);
    expect(player.terraformRating).eq(tr + 2);
    maxOutOceans(player);
    setVenusScaleLevel(game, 30);
    expect(MuseumOfTerraformation.maxedParameters(player)).eq(4);
  });

  it('Plot Contamination: only when an opponent has more plant production', () => {
    const card = new PlotContamination();
    const [, player, opponent] = testGame(2);
    card.play(player);
    expect(player.production.plants).eq(0);
    opponent.production.override({plants: 2});
    card.play(player);
    expect(player.production.plants).eq(1);
  });

  it('Three Planets System', () => {
    const card = new ThreePlanetsSystem();
    const [game, player] = testGame(2, {venusNextExtension: true});
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 6);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(game.getVenusScaleLevel()).eq(2);
    expect(player.production.plants).eq(1);
  });

  it('Corporate Acquisition: any production', () => {
    const card = new CorporateAcquisition();
    const [, player] = testGame(2);
    const options = cast(card.play(player), OrOptions);
    expect(options.options).has.length(6);
    options.options[1].cb();
    expect(player.production.steel).eq(1);
  });

  it('Investment Insurance: +1 M€ production in generations without other increases', () => {
    const card = new InvestmentInsurance();
    const [game, player] = testGame(2);
    player.production.override({megacredits: 2});
    card.play(player);
    player.playedCards.push(card);
    expect(player.production.megacredits).eq(1);
    player.runProductionPhase();
    expect(player.production.megacredits).eq(2);
    // Next generation, M€ production goes up from another source: no bonus.
    game.generation++;
    player.production.add(Resource.MEGACREDITS, 1);
    player.runProductionPhase();
    expect(player.production.megacredits).eq(3);
    game.generation++;
    player.runProductionPhase();
    expect(player.production.megacredits).eq(4);
  });

  it('Dragon Storm', () => {
    const card = new DragonStorm();
    const [, player] = testGame(2);
    expect(card.canAct(player)).is.false;
    player.energy = 1;
    card.action(player);
    expect(player.energy).eq(0);
    expect(player.production.energy).eq(1);
  });

  it('Galileian Tourism: 1 VP per Jovian tag', () => {
    const card = new GalileianTourism();
    const [, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.tagsForTest = {jovian: 2};
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(1);
    player.playedCards.push(card);
    player.tagsForTest = {jovian: 3};
    expect(card.getVictoryPoints(player)).eq(3);
  });

  it('Venusian Ground Laboratory: X M€ + X steel to X titanium', () => {
    const card = new VenusianGroundLaboratory();
    const [game, player] = testGame(2, {venusNextExtension: true});
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 8);
    expect(card.canPlay(player)).is.true;
    expect(card.canAct(player)).is.false;
    player.megaCredits = 5;
    player.steel = 3;
    const amount = cast(card.action(player), SelectAmount);
    expect(amount.max).eq(3);
    amount.cb(3);
    expect(player.megaCredits).eq(2);
    expect(player.steel).eq(0);
    expect(player.titanium).eq(3);
  });

  it('Mercurial Laboratory: X M€ + X titanium to X steel and X energy', () => {
    const card = new MercurialLaboratory();
    const [, player] = testGame(2);
    expect(card.tags).includes(Tag.MERCURY);
    player.megaCredits = 2;
    player.titanium = 4;
    const amount = cast(card.action(player), SelectAmount);
    expect(amount.max).eq(2);
    amount.cb(2);
    expect(player.titanium).eq(2);
    expect(player.steel).eq(2);
    expect(player.energy).eq(2);
  });

  it('Dark Vegetation: plant 2 only with 3 plant tags', () => {
    const card = new DarkVegetation();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 7);
    expect(card.canPlay(player)).is.true;
    expect(card.play(player)).is.undefined;
    expect(player.production.asUnits()).deep.include({plants: 1, heat: 1});
    player.tagsForTest = {plant: 2};
    const options = cast(card.play(player), OrOptions);
    options.options[1].cb();
    expect(player.production.plants).eq(3);
  });

  it('Derived Products: needs 3 VP on cards', () => {
    const card = new DerivedProducts();
    const [, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(new FloatingBaseOnSaturn());
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(2);
  });

  it('Floating Rig', () => {
    const card = new FloatingRig();
    const [game, player] = testGame(2, {venusNextExtension: true});
    expect(card.canPlay(player)).is.true;
    setVenusScaleLevel(game, 18);
    expect(card.canPlay(player)).is.false;
    card.play(player);
    expect(player.production.energy).eq(3);
    player.steel = 1;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(card.resourceCount).eq(1);
    expect(player.steel).eq(0);
  });

  it('Energy Shortcut', () => {
    const card = new EnergyShortcut();
    const [, player] = testGame(2);
    player.energy = 5;
    card.play(player);
    expect(player.energy).eq(0);
    expect(player.heat).eq(5);
  });

  it('Overconsumption Benefits: heat per city on Mars', () => {
    const card = new OverconsumptionBenefits();
    const [game, player] = testGame(2);
    player.tagsForTest = {power: 2};
    expect(card.canPlay(player)).is.true;
    addCity(player);
    addCity(player);
    card.play(player);
    runAllActions(game);
    expect(player.production.heat).eq(2);
  });

  it('Infrastructures', () => {
    const [, player] = testGame(2);
    new Infrastructures().play(player);
    expect(player.production.asUnits()).deep.include({megacredits: 1, steel: 1});
  });

  it('Reptiles: 5 heat for an animal', () => {
    const card = new Reptiles();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    setTemperature(game, 0);
    expect(card.canPlay(player)).is.true;
    player.heat = 5;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(card.resourceCount).eq(1);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Objective Mars: -5 M€ production, 1 VP per budget', () => {
    const card = new ObjectiveMars();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(-5);
    card.action(player);
    runAllActions(game);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Slum: at most 3 cities on Mars, -1 VP', () => {
    const card = new Slum();
    const [game, player, opponent] = testGame(2);
    player.production.override({energy: 1});
    addCity(opponent);
    addCity(opponent);
    addCity(player);
    expect(card.canPlay(player)).is.true;
    addCity(player);
    expect(card.canPlay(player)).is.false;
    expect(card.getVictoryPoints(player)).eq(-1);
    void game;
  });

  it('Bio-Batteries: spend 4 plants', () => {
    const card = new BioBatteries();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.plants = 4;
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    expect(player.plants).eq(0);
    expect(player.production.energy).eq(2);
  });

  it('Pleistocene Megafauna: decreases your and an opponent\'s plant production', () => {
    const card = new PleistoceneMegafauna();
    const [game, player, opponent, third] = testGame(3);
    player.tagsForTest = {science: 5};
    expect(card.canPlay(player)).is.false;
    player.production.override({plants: 1});
    expect(card.canPlay(player)).is.true;
    opponent.production.override({plants: 2});
    third.production.override({plants: 1});
    const select = cast(card.play(player), SelectPlayer);
    select.cb(opponent);
    expect(player.production.plants).eq(0);
    expect(opponent.production.plants).eq(1);
    card.action(player);
    runAllActions(game);
    expect(card.resourceCount).eq(1);
  });

  it('Small Deposit: 2 ore for 2 steel or titanium', () => {
    const card = new SmallDeposit();
    const [game, player] = testGame(2);
    card.play(player);
    runAllActions(game);
    expect(card.resourceCount).eq(6);
    cast(card.action(player), OrOptions).options[1].cb();
    expect(player.titanium).eq(2);
    expect(card.resourceCount).eq(4);
  });

  it('Budget Management: 1 budget with 3 or fewer cards, 2 with none', () => {
    const card = new BudgetManagement();
    const [game, player] = testGame(2);
    expect(card.canAct(player)).is.true;
    card.action(player);
    expect(card.resourceCount).eq(2);
    player.cardsInHand.push(...game.projectDeck.drawN(game, 3));
    card.action(player);
    expect(card.resourceCount).eq(3);
    player.cardsInHand.push(...game.projectDeck.drawN(game, 1));
    expect(card.canAct(player)).is.false;
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Patent Pooling: look at the top card and buy or discard it', () => {
    const card = new PatentPooling();
    const [game, player] = testGame(2);
    player.megaCredits = 3;
    card.action(player);
    runAllActions(game);
    expect(player.popWaitingFor()).is.not.undefined;
  });

  it('Martian Hour: two more actions', () => {
    const card = new MartianHour();
    const [, player] = testGame(2);
    card.play(player);
    expect(player.availableActionsThisRound).eq(4);
  });

  it('Greenery helper sanity', () => {
    const [, player] = testGame(2);
    addGreenery(player);
    expect(player.game.board.getGreeneries(player)).has.length(1);
  });
});
