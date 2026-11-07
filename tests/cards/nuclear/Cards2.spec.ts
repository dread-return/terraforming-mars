import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, fakeCard, runAllActions, setOxygenLevel, setTemperature} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {TileType} from '../../../src/common/TileType';
import {Resource} from '../../../src/common/Resource';
import {CardName} from '../../../src/common/cards/CardName';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Fish} from '../../../src/server/cards/base/Fish';
import {Birds} from '../../../src/server/cards/base/Birds';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {resolve} from './resolve';
import {RadiationShielding} from '../../../src/server/cards/nuclear/RadiationShielding';
import {EsotericCommunity} from '../../../src/server/cards/nuclear/EsotericCommunity';
import {MartianAtomicCommittee} from '../../../src/server/cards/nuclear/MartianAtomicCommittee';
import {SolarIrradiance} from '../../../src/server/cards/nuclear/SolarIrradiance';
import {ForestFires} from '../../../src/server/cards/nuclear/ForestFires';
import {Cockroaches} from '../../../src/server/cards/nuclear/Cockroaches';
import {NeutrinoDetector} from '../../../src/server/cards/nuclear/NeutrinoDetector';
import {IntuitiveProbe} from '../../../src/server/cards/nuclear/IntuitiveProbe';
import {TokamakFunding} from '../../../src/server/cards/nuclear/TokamakFunding';
import {ProforestationFunding} from '../../../src/server/cards/nuclear/ProforestationFunding';
import {TritonCampaign} from '../../../src/server/cards/nuclear/TritonCampaign';
import {NitrateCombustion} from '../../../src/server/cards/nuclear/NitrateCombustion';
import {ExhaustedBars} from '../../../src/server/cards/nuclear/ExhaustedBars';
import {TritiumStation} from '../../../src/server/cards/nuclear/TritiumStation';
import {SpecializedIndustrialComplex} from '../../../src/server/cards/nuclear/SpecializedIndustrialComplex';
import {NuclearClassifiedLaboratory} from '../../../src/server/cards/nuclear/NuclearClassifiedLaboratory';
import {EnergyBudgetCutoffs} from '../../../src/server/cards/nuclear/EnergyBudgetCutoffs';
import {ExtinctionLevelEvent} from '../../../src/server/cards/nuclear/ExtinctionLevelEvent';
import {CEOHeartAttack} from '../../../src/server/cards/nuclear/CEOHeartAttack';
import {NuclearWasteLogistics} from '../../../src/server/cards/nuclear/NuclearWasteLogistics';
import {MainDockingStation} from '../../../src/server/cards/nuclear/MainDockingStation';
import {GeneticMutations} from '../../../src/server/cards/nuclear/GeneticMutations';
import {RadioactiveDecay} from '../../../src/server/cards/nuclear/RadioactiveDecay';
import {IodineIntoxication} from '../../../src/server/cards/nuclear/IodineIntoxication';
import {RelativisticHalfLife} from '../../../src/server/cards/nuclear/RelativisticHalfLife';
import {EnvironmentalDisaster} from '../../../src/server/cards/nuclear/EnvironmentalDisaster';
import {Centrifuge} from '../../../src/server/cards/nuclear/Centrifuge';
import {UraniumMine} from '../../../src/server/cards/nuclear/UraniumMine';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {addCity} from '../../TestingUtils';

function setup(): [IGame, TestPlayer, TestPlayer, RadiationShielding] {
  const [game, player, opponent] = testGame(2, {nuclearExpansion: true});
  const holder = new RadiationShielding();
  player.playedCards.push(holder);
  return [game, player, opponent, holder];
}

describe('Nuclear cards 31-56', () => {
  it('Esoteric Community: counts as a city, 2 M€ adjacency, VP per adjacent special tile', () => {
    const [game, player, opponent] = setup();
    player.production.add(Resource.ENERGY, 2);
    const card = new EsotericCommunity();
    const select = cast(card.play(player), SelectSpace);
    const space = select.spaces[10];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.ESOTERIC_COMMUNITY);
    expect(game.board.getCities(player)).has.length(1);
    expect(player.production.energy).eq(0);
    expect(card.getVictoryPoints(player)).eq(0);
    const next = game.board.getAdjacentSpaces(space).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    game.addTile(opponent, next, {tileType: TileType.NUCLEAR_ZONE});
    runAllActions(game);
    expect(opponent.megaCredits).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Martian Atomic Committee: 1 M€ per 3 radiation', () => {
    const [game, player, opponent, holder] = setup();
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE]}));
    holder.resourceCount = 7;
    opponent.production.add(Resource.MEGACREDITS, 2);
    const card = new MartianAtomicCommittee();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    resolve(player, {player: opponent});
    expect(opponent.production.megacredits).eq(1);
    expect(player.production.megacredits).eq(1);
    expect(player.megaCredits).eq(2);
  });

  it('Solar Irradiance: 3 science tags (icon)', () => {
    const [game, player, , holder] = setup();
    const card = new SolarIrradiance();
    player.production.add(Resource.HEAT, 1);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    expect(player.megaCredits).eq(1);
    expect(player.energy).eq(1);
    expect(holder.resourceCount).eq(1);
  });

  it('Forest Fires: removes a greenery without lowering oxygen', () => {
    const [game, player, opponent] = setup();
    const greenery = addGreenery(opponent);
    const oxygen = game.getOxygenLevel();
    const card = new ForestFires();
    setOxygenLevel(game, 11);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 10);
    const select = cast(card.play(player), SelectSpace);
    select.cb(greenery);
    expect(greenery.tile).is.undefined;
    expect(game.getOxygenLevel()).eq(Math.max(oxygen, 10));
  });

  it('Cockroaches: add an animal, or move a radiation from an opponent', () => {
    const [game, player, opponent, holder] = setup();
    const card = new Cockroaches();
    player.playedCards.push(card);
    player.defer(card.action(player));
    resolve(player);
    expect(card.resourceCount).eq(1);
    const theirs = new RadiationShielding();
    theirs.resourceCount = 2;
    opponent.playedCards.push(theirs);
    player.defer(card.action(player));
    resolve(player, {or: [1]});
    expect(theirs.resourceCount).eq(1);
    expect(holder.resourceCount).eq(1);
    expect(game).is.not.undefined;
  });

  it('Neutrino Detector: offers energy to heat on a science tag', () => {
    const [, player] = setup();
    const card = new NeutrinoDetector();
    player.energy = 2;
    player.defer(card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE]})));
    resolve(player);
    expect(player.energy).eq(1);
    expect(player.heat).eq(1);
    expect(card.onCardPlayed(player, fakeCard({tags: [Tag.EARTH]}))).is.undefined;
  });

  it('Intuitive Probe: reveal for radiation or heat', () => {
    const [game, player, , holder] = setup();
    const card = new IntuitiveProbe();
    player.energy = 2;
    game.projectDeck.drawPile.push(new UraniumMine()); // radioactive + building
    card.action(player);
    runAllActions(game);
    expect(player.energy).eq(1);
    expect(player.heat).eq(2);
    expect(holder.resourceCount).eq(1);
  });

  it('Tokamak Funding: keep 2 of 3', () => {
    const [, player] = setup();
    new TokamakFunding().play(player);
    resolve(player);
    expect(player.cardsInHand).has.length(1);
  });

  it('Proforestation Funding: plants per own greenery', () => {
    const [, player, opponent] = setup();
    addGreenery(player);
    addGreenery(opponent);
    new ProforestationFunding().play(player);
    expect(player.plants).eq(1);
    expect(player.production.plants).eq(1);
  });

  it('Triton Campaign', () => {
    const [, player, , holder] = setup();
    new TritonCampaign().play(player);
    resolve(player, {or: [1]});
    expect(player.production.titanium).eq(1);
    expect(player.titanium).eq(3);
    expect(holder.resourceCount).eq(3);
  });

  it('Nitrate Combustion', () => {
    const [game, player] = setup();
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    new NitrateCombustion().play(player);
    runAllActions(game);
    expect(game.getTemperature()).eq(-28);
    expect(player.production.energy).eq(2);
    expect(tardigrades.resourceCount).eq(2);
  });

  it('Exhausted Bars: three tag requirements', () => {
    const [, player, opponent] = setup();
    const card = new ExhaustedBars();
    opponent.production.add(Resource.TITANIUM, 1);
    player.playedCards.push(fakeCard({tags: [Tag.POWER]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    resolve(player, {player: opponent});
    expect(opponent.production.titanium).eq(0);
    expect(player.production.steel).eq(1);
  });

  it('Tritium Station: 2 radiation for TR after raising TR this generation', () => {
    const [game, player, , holder] = setup();
    const card = new TritiumStation();
    holder.resourceCount = 2;
    expect(card.canAct(player)).is.false;
    player.increaseTerraformRating();
    expect(card.canAct(player)).is.true;
    const tr = player.terraformRating;
    card.action(player);
    resolve(player);
    expect(holder.resourceCount).eq(0);
    expect(player.terraformRating).eq(tr + 1);
    expect(game).is.not.undefined;
  });

  it('Specialized Industrial Complex: steel per special tile; radiation when special tiles are placed', () => {
    const [game, player, opponent, holder] = setup();
    const space = game.board.getAvailableSpacesOnLand(player)[3];
    game.addTile(opponent, space, {tileType: TileType.NUCLEAR_ZONE});
    const card = new SpecializedIndustrialComplex();
    card.play(player);
    expect(player.steel).eq(1);
    player.playedCards.push(card);
    const other = game.board.getAvailableSpacesOnLand(player)[20];
    game.addTile(opponent, other, {tileType: TileType.NUCLEAR_ZONE});
    runAllActions(game);
    expect(holder.resourceCount).eq(1);
  });

  it('Nuclear Classified Laboratory: TR 27 and space discount', () => {
    const [, player] = setup();
    const card = new NuclearClassifiedLaboratory();
    player.setTerraformRating(26);
    expect(card.canPlay(player)).is.false;
    player.setTerraformRating(27);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(player.getCardCost(fakeCard({cost: 10, tags: [Tag.SPACE]}))).eq(9);
  });

  it('Energy Budget Cutoffs: radioactive -1, power +1 and an energy', () => {
    const [, player] = setup();
    const card = new EnergyBudgetCutoffs();
    player.playedCards.push(card);
    expect(player.getCardCost(fakeCard({cost: 10, tags: [Tag.RADIOACTIVE]}))).eq(9);
    expect(player.getCardCost(fakeCard({cost: 10, tags: [Tag.POWER]}))).eq(11);
    card.onCardPlayed(player, fakeCard({tags: [Tag.POWER]}));
    expect(player.energy).eq(1);
  });

  it('Extinction Level Event', () => {
    const [game, player, opponent, holder] = setup();
    const tardigrades = new Tardigrades();
    tardigrades.resourceCount = 3;
    const fish = new Fish();
    fish.resourceCount = 3;
    opponent.playedCards.push(tardigrades, fish);
    new ExtinctionLevelEvent().play(player);
    resolve(player);
    expect(game.getTemperature()).eq(-26);
    expect(tardigrades.resourceCount).eq(1);
    expect(fish.resourceCount).eq(1);
    expect(holder.resourceCount).eq(3);
  });

  it('CEO Heart Attack: steal, then next card is 6 cheaper', () => {
    const [, player, opponent, holder] = setup();
    const theirs = new RadiationShielding();
    theirs.resourceCount = 1;
    opponent.playedCards.push(theirs);
    opponent.megaCredits = 10;
    const card = new CEOHeartAttack();
    card.play(player);
    player.playedCards.push(card);
    resolve(player, {player: opponent});
    expect(player.megaCredits).eq(4);
    expect(holder.resourceCount).eq(1);
    expect(theirs.resourceCount).eq(0);
    const next = fakeCard({cost: 10});
    expect(player.getCardCost(next)).eq(4);
    card.onCardPlayed(player, next);
    expect(player.getCardCost(next)).eq(10);
  });

  it('Nuclear Waste Logistics: radiation per radiation card', () => {
    const [, player, opponent, holder] = setup();
    holder.resourceCount = 1;
    player.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.POWER]}));
    opponent.production.add(Resource.MEGACREDITS, 1);
    const card = new NuclearWasteLogistics();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    resolve(player, {player: opponent});
    expect(holder.resourceCount).eq(2);
    expect(player.production.heat).eq(2);
  });

  it('Main Docking Station: city on its own space, M€ per Mars city plus 1', () => {
    const [game, player] = setup();
    addCity(player);
    new MainDockingStation().play(player);
    runAllActions(game);
    expect(game.board.getSpaceOrThrow(SpaceName.MAIN_DOCKING_STATION).player).eq(player);
    expect(player.production.megacredits).eq(2);
  });

  it('Genetic Mutations: radiation on own greenery; spend 2 to remove plants', () => {
    const [game, player, opponent] = setup();
    const card = new GeneticMutations();
    player.playedCards.push(card, fakeCard({tags: [Tag.PLANT, Tag.PLANT, Tag.RADIOACTIVE]}));
    expect(card.canPlay(player)).is.true;
    addGreenery(player);
    resolve(player, {card: (cards) => cards.findIndex((c) => c.name === CardName.GENETIC_MUTATIONS)});
    expect(card.resourceCount).eq(1);
    card.resourceCount = 2;
    opponent.plants = 3;
    card.action(player);
    resolve(player, {or: [0], player: opponent});
    expect(card.resourceCount).eq(0);
    expect(opponent.plants).eq(1);
    expect(game).is.not.undefined;
  });

  it('Radioactive Decay and Iodine Intoxication', () => {
    const [, player, , holder] = setup();
    const decay = new RadioactiveDecay();
    decay.resourceCount = 1;
    player.playedCards.push(decay);
    decay.action(player);
    resolve(player, {or: [1]});
    expect(player.steel).eq(1);
    expect(player.heat).eq(1);

    const iodine = new IodineIntoxication();
    holder.resourceCount = 2;
    expect(iodine.canPlay(player)).is.false;
    holder.resourceCount = 3;
    expect(iodine.canPlay(player)).is.true;
    iodine.resourceCount = 2;
    player.playedCards.push(iodine);
    iodine.action(player);
    resolve(player, {or: [1]});
    expect(player.energy).eq(3);
    expect(player.heat).eq(2);
  });

  it('Relativistic Half-Life: X radiation for X M€ and X-1 steel', () => {
    const [, player, opponent] = setup();
    const card = new RelativisticHalfLife();
    expect(card.canPlay(player)).is.false;
    player.production.add(Resource.STEEL, 1);
    expect(card.canPlay(player)).is.true;
    const theirs = new RadiationShielding();
    theirs.resourceCount = 3;
    opponent.playedCards.push(theirs);
    player.defer(card.action(player));
    resolve(player);
    expect(theirs.resourceCount).eq(0);
    expect(player.megaCredits).eq(3);
    expect(player.steel).eq(2);
  });

  it('Environmental Disaster', () => {
    const [game, player, opponent, holder] = setup();
    const card = new EnvironmentalDisaster();
    player.playedCards.push(fakeCard({tags: [Tag.PLANT]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.ANIMAL]}));
    expect(card.canPlay(player)).is.true;
    opponent.plants = 3;
    const birds = new Birds();
    birds.resourceCount = 2;
    opponent.playedCards.push(birds);
    card.play(player);
    resolve(player, {player: opponent});
    expect(game.getTemperature()).eq(-28);
    expect(opponent.plants).eq(1);
    expect(birds.resourceCount).eq(1);
    expect(holder.resourceCount).eq(2);
  });

  it('Centrifuge: spend a resource for radiation; adding radiation gives steel or titanium', () => {
    const [, player, , holder] = setup();
    const card = new Centrifuge();
    player.playedCards.push(card);
    player.heat = 1;
    expect(card.canAct(player)).is.true;
    player.defer(card.action(player));
    resolve(player, {card: (cards) => cards.findIndex((c) => c.name === holder.name)});
    expect(player.heat).eq(0);
    expect(holder.resourceCount).eq(1);
    expect(player.steel).eq(1);
  });

  it('setTemperature helper import', () => {
    const [game] = setup();
    setTemperature(game, 0);
    expect(game.getTemperature()).eq(0);
  });
});
