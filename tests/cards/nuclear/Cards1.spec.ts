import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, fakeCard, maxOutOceans, runAllActions, setOxygenLevel, setTemperature} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {CardResource} from '../../../src/common/CardResource';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Fish} from '../../../src/server/cards/base/Fish';
import {RadiationShielding} from '../../../src/server/cards/nuclear/RadiationShielding';
import {RadioactiveEnhancement} from '../../../src/server/cards/nuclear/RadioactiveEnhancement';
import {AtomicTest} from '../../../src/server/cards/nuclear/AtomicTest';
import {NuclearWinter} from '../../../src/server/cards/nuclear/NuclearWinter';
import {MutatedTrees} from '../../../src/server/cards/nuclear/MutatedTrees';
import {Neutronia} from '../../../src/server/cards/nuclear/Neutronia';
import {Chemtrails} from '../../../src/server/cards/nuclear/Chemtrails';
import {FuelRods} from '../../../src/server/cards/nuclear/FuelRods';
import {Jellyfish} from '../../../src/server/cards/nuclear/Jellyfish';
import {BecquerelFluctuations} from '../../../src/server/cards/nuclear/BecquerelFluctuations';
import {IonizedGasHarvest} from '../../../src/server/cards/nuclear/IonizedGasHarvest';
import {SolarFlare} from '../../../src/server/cards/nuclear/SolarFlare';
import {CosmicRayAnalysis} from '../../../src/server/cards/nuclear/CosmicRayAnalysis';
import {SoilDecontamination} from '../../../src/server/cards/nuclear/SoilDecontamination';
import {FukushimaFarming} from '../../../src/server/cards/nuclear/FukushimaFarming';
import {ColdFusionReactor} from '../../../src/server/cards/nuclear/ColdFusionReactor';
import {UraniumEnrichmentFacility} from '../../../src/server/cards/nuclear/UraniumEnrichmentFacility';
import {EnvironmentContamination} from '../../../src/server/cards/nuclear/EnvironmentContamination';
import {ParticleAccelerator} from '../../../src/server/cards/nuclear/ParticleAccelerator';
import {H2OMoleculesResearch} from '../../../src/server/cards/nuclear/H2OMoleculesResearch';
import {CoolingLiquidEmergency} from '../../../src/server/cards/nuclear/CoolingLiquidEmergency';
import {Stormfarm} from '../../../src/server/cards/nuclear/Stormfarm';
import {ITERFunding} from '../../../src/server/cards/nuclear/ITERFunding';
import {UraniumMine} from '../../../src/server/cards/nuclear/UraniumMine';
import {ThoriumReactor} from '../../../src/server/cards/nuclear/ThoriumReactor';
import {OceanicAtomicTests} from '../../../src/server/cards/nuclear/OceanicAtomicTests';
import {PropagandaConference} from '../../../src/server/cards/nuclear/PropagandaConference';
import {PowerPlantStandardProject} from '../../../src/server/cards/base/standardProjects/PowerPlantStandardProject';
import {Resource} from '../../../src/common/Resource';
import {CardName} from '../../../src/common/cards/CardName';
import {TestPlayer} from '../../TestPlayer';
import {resolve} from './resolve';
import {Payment} from '../../../src/common/inputs/Payment';
import {Birds} from '../../../src/server/cards/base/Birds';
import {IGame} from '../../../src/server/IGame';

function setup(): [IGame, TestPlayer, TestPlayer, RadiationShielding] {
  const [game, player, opponent] = testGame(2, {nuclearExpansion: true});
  const holder = new RadiationShielding();
  player.playedCards.push(holder);
  return [game, player, opponent, holder];
}

describe('Nuclear cards 01-30', () => {
  it('Radioactive Enhancement: radiation per temperature step', () => {
    const [game, player, , holder] = setup();
    const card = new RadioactiveEnhancement();
    card.play(player);
    expect(player.production.energy).eq(1);
    player.playedCards.push(card);
    game.increaseTemperature(player, 2);
    runAllActions(game);
    expect(holder.resourceCount).eq(2);
  });

  it('Atomic Test: heat per temperature step, plants removed, 4 radiation', () => {
    const [game, player, opponent, holder] = setup();
    setTemperature(game, -20);
    opponent.plants = 5;
    new AtomicTest().play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);
    expect(player.heat).eq(5);
    expect(opponent.plants).eq(2);
    expect(holder.resourceCount).eq(4);
  });

  it('Nuclear Winter: hand limit and production', () => {
    const [game, player, opponent, holder] = setup();
    const card = new NuclearWinter();
    player.production.add(Resource.PLANTS, 1);
    opponent.production.add(Resource.HEAT, 1);
    player.cardsInHand.push(card, ...Array(5).fill(0).map(() => fakeCard()));
    expect(card.canPlay(player)).is.true;
    player.cardsInHand.push(fakeCard());
    expect(card.canPlay(player)).is.false;
    opponent.plants = 3;
    card.play(player);
    resolve(player, {player: opponent});
    expect(opponent.production.heat).eq(0);
    expect(opponent.plants).eq(1);
    expect(player.production.plants).eq(0);
    expect(player.production.steel).eq(2);
    expect(holder.resourceCount).eq(2);
  });

  it('Mutated Trees: plant production per card with microbes or animals', () => {
    const [game, player] = setup();
    setOxygenLevel(game, 6);
    const tardigrades = new Tardigrades();
    tardigrades.resourceCount = 1;
    const fish = new Fish();
    fish.resourceCount = 2;
    player.playedCards.push(tardigrades, fish, new Birds());
    const card = new MutatedTrees();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(game.getOxygenLevel()).eq(7);
    expect(player.production.plants).eq(2);
  });

  it('Neutronia: production and a city', () => {
    const [game, player] = setup();
    player.production.add(Resource.ENERGY, 2);
    new Neutronia().play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace);
    expect(player.production.energy).eq(0);
    expect(player.production.megacredits).eq(3);
    expect(player.production.steel).eq(1);
  });

  it('Chemtrails: max 9% oxygen, oxygen, titanium', () => {
    const [game, player] = setup();
    const card = new Chemtrails();
    setOxygenLevel(game, 10);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 9);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(game.getOxygenLevel()).eq(10);
    expect(player.production.titanium).eq(1);
    expect(player.titanium).eq(1);
    expect(player.steel).eq(1);
  });

  it('Fuel Rods: heat and radiation, or heat into M€', () => {
    const [game, player, , holder] = setup();
    const card = new FuelRods();
    setTemperature(game, -20);
    expect(card.canPlay(player)).is.false;
    setTemperature(game, -18);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.action(player);
    resolve(player, {or: [0]});
    expect(player.heat).eq(1);
    expect(holder.resourceCount).eq(1);
    card.action(player);
    resolve(player, {or: [1]});
    expect(player.heat).eq(0);
    expect(player.megaCredits).eq(3);
  });

  it('Jellyfish: animals per 2 oceans', () => {
    const [game, player] = setup();
    maxOutOceans(player, 5);
    const card = new Jellyfish();
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.play(player);
    runAllActions(game);
    expect(card.resourceCount).eq(2);
    card.action(player);
    runAllActions(game);
    expect(card.resourceCount).eq(3);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Becquerel Fluctuations: titanium production changes give titanium and radiation', () => {
    const [game, player] = setup();
    const card = new BecquerelFluctuations();
    player.playedCards.push(card);
    player.production.add(Resource.TITANIUM, 1);
    runAllActions(game);
    expect(player.titanium).eq(1);
    resolve(player);
    player.production.add(Resource.TITANIUM, -1);
    resolve(player);
    expect(player.titanium).eq(2);
    expect(card.resourceCount + (player.playedCards.get(CardName.RADIATION_SHIELDING)?.resourceCount ?? 0)).eq(2);
  });

  it('Ionized Gas Harvest: draws 2; spend titanium for 2 radiation; remove for energy and steel', () => {
    const [game, player] = setup();
    const card = new IonizedGasHarvest();
    card.play(player);
    expect(player.cardsInHand).has.length(2);
    player.playedCards.push(card);
    player.titanium = 1;
    card.action(player);
    resolve(player, {or: [0], card: (cards) => cards.findIndex((c) => c.name === card.name)});
    expect(card.resourceCount).eq(2);
    // With no titanium left, removing a radiation is the only option.
    card.action(player);
    resolve(player);
    expect(card.resourceCount).eq(1);
    expect(player.energy).eq(1);
    expect(player.steel).eq(1);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Solar Flare: temperature and removals', () => {
    const [game, player, opponent] = setup();
    const fish = new Fish();
    fish.resourceCount = 2;
    const shielding = new RadiationShielding();
    shielding.resourceCount = 3;
    opponent.playedCards.push(fish, shielding);
    opponent.plants = 4;
    new SolarFlare().play(player);
    resolve(player, {player: opponent});
    expect(game.getTemperature()).eq(-28);
    expect(opponent.plants).eq(2);
    expect(fish.resourceCount).eq(1);
    expect(shielding.resourceCount).eq(1);
  });

  it('Cosmic Ray Analysis: radiation per 2 radioactive tags, including this', () => {
    const [game, player, , holder] = setup();
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE]}));
    player.production.add(Resource.HEAT, 1);
    new CosmicRayAnalysis().play(player);
    runAllActions(game);
    // holder (Radiation Shielding) also has a radioactive tag: 3 tags in total -> 1.
    expect(holder.resourceCount).eq(1);
    expect(player.production.titanium).eq(1);
  });

  it('Soil Decontamination: production swap, plants, microbe and radiation', () => {
    const [game, player, opponent, holder] = setup();
    player.playedCards.push(fakeCard({tags: [Tag.MARS, Tag.MARS]}));
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    opponent.production.add(Resource.PLANTS, 1);
    const card = new SoilDecontamination();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    resolve(player, {player: opponent});
    expect(opponent.production.plants).eq(0);
    expect(player.production.megacredits).eq(-1);
    expect(player.production.plants).eq(2);
    expect(player.plants).eq(2);
    expect(tardigrades.resourceCount).eq(1);
    expect(holder.resourceCount).eq(2);
  });

  it('Fukushima Farming', () => {
    const [game, player, , holder] = setup();
    setTemperature(game, -12);
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    const card = new FukushimaFarming();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    expect(player.production.plants).eq(2);
    expect(player.plants).eq(1);
    expect(tardigrades.resourceCount).eq(2);
    expect(holder.resourceCount).eq(3);
  });

  it('Cold Fusion Reactor: 6 radioactive tags in play', () => {
    const [, player, opponent] = setup();
    const card = new ColdFusionReactor();
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE, Tag.RADIOACTIVE]}));
    opponent.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE, Tag.RADIOACTIVE]}));
    expect(card.canPlay(player)).is.false;
    opponent.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE]}));
    expect(card.canPlay(player)).is.true;
    const tr = player.terraformRating;
    card.play(player);
    expect(player.production.energy).eq(5);
    expect(player.terraformRating).eq(tr + 2);
  });

  it('Uranium Enrichment Facility: steel or titanium for radiation; 1 VP per 4', () => {
    const [game, player] = setup();
    const card = new UraniumEnrichmentFacility();
    player.playedCards.push(card);
    player.steel = 1;
    card.resourceCount = 3;
    card.action(player);
    resolve(player, {or: [0], card: (cards) => cards.findIndex((c) => c.name === card.name)});
    expect(player.steel).eq(0);
    expect(card.resourceCount).eq(4);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Environment Contamination: 1 plant for 2 radiation', () => {
    const [game, player] = setup();
    const card = new EnvironmentContamination();
    player.playedCards.push(card);
    player.plants = 1;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    const input = player.popWaitingFor();
    if (input !== undefined) {
      cast(input, SelectCard).cb([card]);
    }
    expect(player.plants).eq(0);
    expect(card.resourceCount).eq(2);
  });

  it('Particle Accelerator: radiation per science/power tag; spend for resources', () => {
    const [game, player, , holder] = setup();
    const card = new ParticleAccelerator();
    player.playedCards.push(card);
    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE, Tag.POWER]}));
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([holder]);
    expect(holder.resourceCount).eq(2);
    card.resourceCount = 1;
    card.action(player);
    resolve(player, {or: [2]});
    expect(player.heat).eq(2);
    expect(card.resourceCount).eq(0);
  });

  it('H2O Molecules Research: science resource on science tag, 3 VP', () => {
    const [game, player] = setup();
    maxOutOceans(player, 3);
    const card = new H2OMoleculesResearch();
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    player.megaCredits = 3;
    game.projectDeck.drawPile.push(new ParticleAccelerator());
    card.action(player);
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(card.resourceCount).eq(1);
    expect(card.getVictoryPoints()).eq(3);
  });

  it('Cooling Liquid Emergency: ocean with +1 M€ per adjacent ocean', () => {
    const [game, player, , holder] = setup();
    new CoolingLiquidEmergency().play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    runAllActions(game);
    expect(game.board.getOceanSpaces()).has.length(1);
    expect(player.heat).eq(1);
    expect(holder.resourceCount).eq(3);
  });

  it('Stormfarm: production choice then optional conversion', () => {
    const [game, player] = setup();
    player.energy = 5;
    new Stormfarm().play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb();
    runAllActions(game);
    expect(player.production.heat).eq(1);
    const or = cast(player.popWaitingFor(), OrOptions);
    cast(or.options[0], SelectOption).cb();
    expect(player.energy).eq(0);
    expect(player.heat).eq(5);
  });

  it('ITER Funding: 6 Earth tags in play; steal 1 M€ from each opponent', () => {
    const [, player, opponent] = setup();
    const card = new ITERFunding();
    player.playedCards.push(fakeCard({tags: [Tag.EARTH, Tag.EARTH, Tag.EARTH]}));
    opponent.playedCards.push(fakeCard({tags: [Tag.EARTH, Tag.EARTH, Tag.EARTH]}));
    expect(card.canPlay(player)).is.true;
    opponent.megaCredits = 5;
    card.play(player);
    expect(player.production.megacredits).eq(2);
    expect(player.megaCredits).eq(1);
    expect(opponent.megaCredits).eq(4);
  });

  it('Uranium Mine and Thorium Reactor', () => {
    const [game, player, , holder] = setup();
    new UraniumMine().play(player);
    runAllActions(game);
    expect(player.production.steel).eq(1);
    expect(player.production.titanium).eq(1);
    expect(holder.resourceCount).eq(1);
    const thorium = new ThoriumReactor();
    setTemperature(game, -6);
    expect(thorium.canPlay(player)).is.false;
    setTemperature(game, -8);
    expect(thorium.canPlay(player)).is.true;
    player.playedCards.push(thorium, fakeCard({tags: [Tag.RADIOACTIVE]}));
    // Thorium + Radiation Shielding + fake = 3 radioactive tags.
    expect(thorium.getVictoryPoints(player)).eq(1);
  });

  it('Oceanic Atomic Tests: radiation per ocean, cost shift by temperature, 5 radiation spread', () => {
    const [game, player, opponent, holder] = setup();
    const card = new OceanicAtomicTests();
    const tr = player.terraformRating;
    card.play(player);
    runAllActions(game);
    expect(holder.resourceCount).eq(5);
    expect(player.terraformRating).eq(tr + 1);
    player.playedCards.push(card);
    const other = fakeCard({cost: 10});
    expect(player.getCardCost(other)).eq(9);
    setTemperature(game, -2);
    expect(player.getCardCost(other)).eq(11);
    maxOutOceans(opponent, 1);
    runAllActions(game);
    expect(holder.resourceCount).eq(6);
  });

  it('Propaganda Conference: next standard project costs 8 less', () => {
    const [game, player] = setup();
    const card = new PropagandaConference();
    card.play(player);
    player.playedCards.push(card);
    expect(player.production.megacredits).eq(1);
    const powerPlant = new PowerPlantStandardProject();
    expect(powerPlant.getAdjustedCost(player)).eq(3);
    player.megaCredits = 3;
    expect(powerPlant.canAct(player)).is.true;
    powerPlant.payAndExecute(player, Payment.of({megacredits: 3}));
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(powerPlant.getAdjustedCost(player)).eq(11);
  });

  it('greenery helper import', () => {
    const [, player] = setup();
    expect(addGreenery(player).tile).is.not.undefined;
    expect(CardResource.RADIATION).is.not.undefined;
  });
});
