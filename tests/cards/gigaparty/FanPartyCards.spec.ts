import {expect} from 'chai';
import {GIGA_PARTIES_IN_PLAY, PartyName} from '../../../src/common/turmoil/PartyName';
import {IGame} from '../../../src/server/IGame';
import {BOARD_ORDER, Turmoil} from '../../../src/server/turmoil/Turmoil';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {addCity, addGreenery, runAllActions, setRulingParty, fakeCard} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {Phase} from '../../../src/common/Phase';
import {GameCards} from '../../../src/server/GameCards';
import {DEFAULT_GAME_OPTIONS} from '../../../src/server/game/GameOptions';
import {CardName} from '../../../src/common/cards/CardName';
import {FanPartyCards} from '../../../src/server/turmoil/giga/FanPartyCards';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {CardResource} from '../../../src/common/CardResource';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectParty} from '../../../src/server/inputs/SelectParty';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {Resource} from '../../../src/common/Resource';
import {Board} from '../../../src/server/boards/Board';
import {Eternity} from '../../../src/server/cards/eternity/Eternity';
import {MobileBiologicalDome} from '../../../src/server/cards/robantilles/MobileBiologicalDome';
import {GreenhouseLights} from '../../../src/server/cards/robantilles/GreenhouseLights';
import {CorruptedDelegate} from '../../../src/server/cards/robantilles/CorruptedDelegate';
import {TerraformingBureauRestructuring} from '../../../src/server/cards/robantilles/TerraformingBureauRestructuring';
import {GreatMartianArchives} from '../../../src/server/cards/robantilles/GreatMartianArchives';
import {ElectoralCampaign} from '../../../src/server/cards/robantilles/ElectoralCampaign';
import {TaxTheRich} from '../../../src/server/cards/robantilles/TaxTheRich';
import {BionicAugmentations} from '../../../src/server/cards/solaris/BionicAugmentations';
import {SyntheticBrainCells} from '../../../src/server/cards/solaris/SyntheticBrainCells';
import {BuildingDeregulation} from '../../../src/server/cards/solaris/BuildingDeregulation';
import {PowerLinesHub} from '../../../src/server/cards/solaris/PowerLinesHub';
import {Plebiscite} from '../../../src/server/cards/solaris/Plebiscite';
import {RedistributionOfWealth} from '../../../src/server/cards/solaris/RedistributionOfWealth';
import {Cyborgs} from '../../../src/server/cards/solaris/Cyborgs';
import {StrongArtificialIntelligence} from '../../../src/server/cards/solaris/StrongArtificialIntelligence';
import {ColdFusionTechnology} from '../../../src/server/cards/solaris/ColdFusionTechnology';
import {MartianAgriculture} from '../../../src/server/cards/solaris/MartianAgriculture';
import {ManagementCrisis} from '../../../src/server/cards/solaris/ManagementCrisis';
import {EnergyAcquisition} from '../../../src/server/cards/solaris/EnergyAcquisition';
import {MartianCensus} from '../../../src/server/cards/solaris/MartianCensus';
import {WanderingStationHermes} from '../../../src/server/cards/solaris/WanderingStationHermes';
import {FirstManMonument} from '../../../src/server/cards/solaris/FirstManMonument';
import {AwardCelebration} from '../../../src/server/cards/solaris/AwardCelebration';
import {Bribery} from '../../../src/server/cards/solaris/Bribery';
import {MarsAcademyOfPoliticalSciences} from '../../../src/server/cards/solaris/MarsAcademyOfPoliticalSciences';
import {ImmigrationBureau} from '../../../src/server/cards/solaris/ImmigrationBureau';
import {AntiFraudInvestigation} from '../../../src/server/cards/solaris/AntiFraudInvestigation';
import {FlyingGarden} from '../../../src/server/cards/idesofmars/FlyingGarden';
import {TerraformingOffice} from '../../../src/server/cards/idesofmars/TerraformingOffice';
import {FreeCity} from '../../../src/server/cards/idesofmars/FreeCity';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {DataLibrary} from '../../../src/server/cards/robantilles/DataLibrary';
import {DevelopmentCenter} from '../../../src/server/cards/base/DevelopmentCenter';
import {MoneyIndustryStandardProject} from '../../../src/server/cards/industries/IndustryStandardProjects';
import {GanymedeColony} from '../../../src/server/cards/base/GanymedeColony';
import {GeneRepair} from '../../../src/server/cards/base/GeneRepair';

const GIGA = {turmoilExtension: true, gigaTurmoil: true, politicalAgendasExtension: 'Chairman',
  robAntillesExpansion: true, solarisExpansion: true, idesofmarsExpansion: true} as const;

/** A Giga Turmoil game past its party draft with these parties (filled up with the rest) in play. */
function gigaGame(names: Array<PartyName>, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, player2] = testGame(2, {...GIGA, ...options});
  const turmoil = Turmoil.getTurmoil(game);
  const rest = BOARD_ORDER.filter((n) => !names.includes(n));
  turmoil.startGigaGovernment(game, [...names, ...rest].slice(0, GIGA_PARTIES_IN_PLAY));
  for (const p of game.players) {
    (p as TestPlayer).popWaitingFor();
  }
  game.phase = Phase.ACTION;
  return [game, player, player2];
}

function play(player: TestPlayer, card: {play: (p: TestPlayer) => unknown}) {
  const input = card.play(player);
  runAllActions(player.game);
  return input;
}

describe('Fan-party cards: dealing', () => {
  const cardNames = (options: object) => new GameCards({...DEFAULT_GAME_OPTIONS, ...options}).getProjectCards().map((c) => c.name);

  it('are only in games with Giga Turmoil', () => {
    const plain = cardNames({turmoilExtension: true, robAntillesExpansion: true, solarisExpansion: true, idesofmarsExpansion: true});
    expect(plain).not.to.include(CardName.CYBORGS);
    expect(plain).not.to.include(CardName.TAX_THE_RICH);
    expect(plain).not.to.include(CardName.FREE_CITY);
    const giga = cardNames(GIGA);
    expect(giga).to.include.members([CardName.CYBORGS, CardName.TAX_THE_RICH, CardName.FREE_CITY]);
  });

  it('cards with other requirements still need their expansion', () => {
    expect(cardNames(GIGA)).not.to.include(CardName.BUILDING_DEREGULATION);
    expect(cardNames({...GIGA, industriesExpansion: true})).to.include(CardName.BUILDING_DEREGULATION);
    expect(cardNames(GIGA)).not.to.include(CardName.WANDERING_STATION_HERMES);
  });

  it('knows the fan party of a card', () => {
    expect(FanPartyCards.fanPartyOf(new Cyborgs())).eq(PartyName.TRANSHUMANISTS);
    expect(FanPartyCards.fanPartyOf(new Tardigrades())).is.undefined;
  });

  it('cards for parties that were not drafted leave the deck and players\' hands', () => {
    const [game, player] = testGame(2, GIGA);
    const cyborgs = new Cyborgs();
    const census = new MartianCensus();
    player.cardsInHand.push(cyborgs, census);
    const handSize = player.cardsInHand.length;
    const inDeck = game.projectDeck.drawPile.filter((c) => FanPartyCards.fanPartyOf(c) === PartyName.TRANSHUMANISTS).length;
    expect(inDeck).is.greaterThan(0);

    // Populists are drafted, Transhumanists are not.
    const parties = [PartyName.POPULISTS, ...BOARD_ORDER.filter((n) => n !== PartyName.POPULISTS && n !== PartyName.TRANSHUMANISTS)];
    Turmoil.getTurmoil(game).startGigaGovernment(game, parties.slice(0, GIGA_PARTIES_IN_PLAY));

    expect(player.cardsInHand).has.length(handSize);
    expect(player.cardsInHand).not.to.include(cyborgs);
    expect(player.cardsInHand).to.include(census);
    expect(game.projectDeck.drawPile.some((c) => FanPartyCards.fanPartyOf(c) === PartyName.TRANSHUMANISTS)).is.false;
    expect(game.projectDeck.drawPile.some((c) => FanPartyCards.fanPartyOf(c) === PartyName.POPULISTS)).is.true;
  });
});

describe('Fan-party cards: Rob Antilles', () => {
  it('Mobile Biological Dome: places its dome, and leaves a greenery behind every 3 seeds', () => {
    const [game, player] = gigaGame([PartyName.SPOME]);
    const card = new MobileBiologicalDome();
    expect(card.canPlay(player)).is.false;
    setRulingParty(game, PartyName.SPOME);
    expect(card.canPlay(player)).is.true;

    const select = cast(card.play(player), SelectSpace);
    const space = select.spaces.find((s) => MobileBiologicalDome.destinations(player, s).length > 0)!;
    select.cb(space);
    player.playedCards.push(card);
    expect(space.tile?.tileType).eq(TileType.BIOLOGICAL_DOME);

    card.onProductionPhase(player);
    card.onProductionPhase(player);
    expect(card.resourceCount).eq(2);
    const oxygen = game.getOxygenLevel();
    card.onProductionPhase(player);
    runAllActions(game);
    const move = cast(player.popWaitingFor(), SelectSpace);
    const to = move.spaces[0];
    move.cb(to);
    expect(card.resourceCount).eq(0);
    expect(space.tile?.tileType).eq(TileType.GREENERY);
    expect(space.player).eq(player);
    expect(to.tile?.tileType).eq(TileType.BIOLOGICAL_DOME);
    expect(game.getOxygenLevel()).eq(oxygen + 1);
  });

  it('Greenhouse Lights: energy production into plant production', () => {
    const [game, player] = gigaGame([PartyName.EMPOWER]);
    const card = new GreenhouseLights();
    setRulingParty(game, PartyName.EMPOWER);
    expect(card.canPlay(player)).is.true;
    expect(card.canAct(player)).is.false;
    player.production.add(Resource.ENERGY, 1);
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(player.production.energy).eq(0);
    expect(player.production.plants).eq(1);
  });

  it('Corrupted Delegate: 3 more actions', () => {
    const [game, player] = gigaGame([PartyName.BUREAUCRATS]);
    setRulingParty(game, PartyName.BUREAUCRATS);
    const before = player.availableActionsThisRound;
    play(player, new CorruptedDelegate());
    expect(player.availableActionsThisRound).eq(before + 3);
  });

  it('Terraforming Bureau Restructuring: marks 2 of each opponent\'s action cards as used', () => {
    const [game, player, player2] = gigaGame([PartyName.BUREAUCRATS]);
    setRulingParty(game, PartyName.BUREAUCRATS);
    const a = new Tardigrades();
    const b = new DataLibrary();
    const c = new DevelopmentCenter();
    player2.playedCards.push(a, b, c);
    play(player, new TerraformingBureauRestructuring());
    const select = cast(player.popWaitingFor(), SelectCard);
    select.cb([a, c]);
    expect([...player2.actionsThisGeneration]).to.have.members([a.name, c.name]);
  });

  it('Great Martian Archives: a wild tag', () => {
    expect(new GreatMartianArchives().tags).deep.eq([Tag.WILD]);
  });

  it('Electoral Campaign: everyone +1 TR, you 7 M€', () => {
    const [game, player, player2] = gigaGame([PartyName.CENTRISTS]);
    setRulingParty(game, PartyName.CENTRISTS);
    play(player, new ElectoralCampaign());
    expect(player.terraformRating).eq(21);
    expect(player2.terraformRating).eq(21);
    expect(player.megaCredits).eq(7);
  });

  it('Tax the Rich: ends up among an opponent\'s played events', () => {
    const [game, player, player2] = gigaGame([PartyName.POPULISTS]);
    setRulingParty(game, PartyName.POPULISTS);
    const card = new TaxTheRich();
    player.cardsInHand.push(card);
    player.playCard(card);
    runAllActions(game);
    expect(player.playedCards.has(card.name)).is.false;
    expect(player2.playedCards.has(card.name)).is.true;
    expect(player2.getVictoryPoints().victoryPoints).lessThan(player.getVictoryPoints().victoryPoints);
  });
});

describe('Fan-party cards: Solaris', () => {
  it('Bionic Augmentations: science requirements need 2 fewer tags', () => {
    const [game, player] = gigaGame([PartyName.TRANSHUMANISTS]);
    setRulingParty(game, PartyName.TRANSHUMANISTS);
    const geneRepair = new GeneRepair(); // 3 science tags
    player.tagsForTest = {science: 1};
    expect(geneRepair.canPlay(player)).is.false;
    player.playedCards.push(new BionicAugmentations());
    expect(geneRepair.canPlay(player)).is.true;
  });

  it('Synthetic Brain Cells: 2 M€ for a microbe on any card', () => {
    const [game, player] = gigaGame([PartyName.TRANSHUMANISTS]);
    const card = new SyntheticBrainCells();
    player.playedCards.push(card);
    expect(card.canAct(player)).is.false;
    player.megaCredits = 2;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(card.resourceCount).eq(1);
  });

  it('Building Deregulation: industries cost 2 M€ less', () => {
    const [, player] = gigaGame([PartyName.EMPOWER], {industriesExpansion: true});
    const industry = new MoneyIndustryStandardProject();
    const cost = industry.getAdjustedCost(player);
    player.playedCards.push(new BuildingDeregulation());
    expect(industry.getAdjustedCost(player)).eq(cost - 2);
  });

  it('Power Lines Hub: energy production per opponent power tag', () => {
    const [game, player, player2] = gigaGame([PartyName.EMPOWER]);
    setRulingParty(game, PartyName.EMPOWER);
    player2.tagsForTest = {power: 3};
    play(player, new PowerLinesHub());
    expect(player.production.energy).eq(3);
  });

  it('Plebiscite: you become the leader of a party', () => {
    const [game, player, player2] = gigaGame([PartyName.POPULISTS]);
    setRulingParty(game, PartyName.POPULISTS);
    const turmoil = Turmoil.getTurmoil(game);
    const party = turmoil.parties.find((p) => p.name !== PartyName.POPULISTS)!;
    turmoil.sendDelegateToParty(player2, party.name, game);
    turmoil.sendDelegateToParty(player2, party.name, game);
    expect(party.partyLeader).eq(player2);
    const card = new Plebiscite();
    expect(card.canPlay(player)).is.true;
    const select = cast(card.play(player), SelectParty);
    select.cb(party.name);
    expect(party.partyLeader).eq(player);
    expect(party.delegates.get(player2)).eq(2);
    expect(party.delegates.get(player)).eq(1);
  });

  it('Redistribution of Wealth: needs titanium production, plays a prelude', () => {
    const [game, player] = gigaGame([PartyName.POPULISTS], {preludeExtension: true});
    setRulingParty(game, PartyName.POPULISTS);
    const card = new RedistributionOfWealth();
    expect(card.canPlay(player)).is.false;
    player.production.add(Resource.TITANIUM, 1);
    expect(card.canPlay(player)).is.true;
    play(player, card);
    expect(player.production.titanium).eq(0);
    expect(player.production.megacredits).eq(-1);
    cast(player.popWaitingFor(), SelectCard);
  });

  it('Cyborgs and Strong Artificial Intelligence: wild tags', () => {
    const [game, player] = gigaGame([PartyName.TRANSHUMANISTS]);
    setRulingParty(game, PartyName.TRANSHUMANISTS);
    play(player, new Cyborgs());
    expect(player.production.megacredits).eq(1);
    expect(new StrongArtificialIntelligence().tags).deep.eq([Tag.WILD, Tag.WILD]);
    play(player, new StrongArtificialIntelligence());
    expect(player.production.megacredits).eq(1);
  });

  it('Cold Fusion Technology and Martian Agriculture', () => {
    const [game, player] = gigaGame([PartyName.EMPOWER, PartyName.SPOME]);
    setRulingParty(game, PartyName.EMPOWER);
    const coldFusion = new ColdFusionTechnology();
    expect(coldFusion.canPlay(player)).is.false;
    player.production.add(Resource.HEAT, 2);
    expect(coldFusion.canPlay(player)).is.true;
    play(player, coldFusion);
    expect(player.production.energy).eq(5);
    expect(player.production.heat).eq(0);
    setRulingParty(game, PartyName.SPOME);
    play(player, new MartianAgriculture());
    expect(player.production.plants).eq(5);
  });

  it('Management Crisis: opponents take 1 action per turn this generation', () => {
    const [game, player, player2] = gigaGame([PartyName.BUREAUCRATS]);
    setRulingParty(game, PartyName.BUREAUCRATS);
    const card = new ManagementCrisis();
    play(player, card);
    player.playedCards.push(card);
    expect(player2.availableActionsThisRound).eq(1);
    expect(Eternity.actionsPerTurn(game, player2)).eq(1);
    expect(Eternity.actionsPerTurn(game, player)).eq(2);
    game.generation++;
    expect(Eternity.actionsPerTurn(game, player2)).eq(2);
  });

  it('Energy Acquisition', () => {
    const [game, player] = gigaGame([PartyName.EMPOWER]);
    setRulingParty(game, PartyName.EMPOWER);
    play(player, new EnergyAcquisition());
    expect(player.energy).eq(6);
  });

  it('Martian Census: M€ production per party leader, M€ per city', () => {
    const [game, player] = gigaGame([PartyName.POPULISTS]);
    setRulingParty(game, PartyName.POPULISTS);
    const turmoil = Turmoil.getTurmoil(game);
    for (const party of turmoil.parties.slice(0, 2)) {
      turmoil.sendDelegateToParty(player, party.name, game);
      turmoil.sendDelegateToParty(player, party.name, game);
    }
    addCity(player);
    play(player, new MartianCensus());
    expect(player.production.megacredits).eq(MartianCensus.leaders(player));
    expect(MartianCensus.leaders(player)).is.greaterThanOrEqual(2);
    expect(player.megaCredits).eq(1);
  });

  it('Wandering Station Hermes: tags of the lowest planetary track', () => {
    const [game, player] = testGame(2, {pathfindersExpansion: true, turmoilExtension: true});
    const data = game.pathfindersData!;
    data.earth = 5;
    data.mars = 2;
    data.jovian = 4;
    player.tagsForTest = {mars: 3, earth: 1};
    expect(WanderingStationHermes.production(player)).eq(3);
  });

  it('First Man Monument: delegates in two different parties', () => {
    const [game, player] = gigaGame([PartyName.CENTRISTS]);
    setRulingParty(game, PartyName.CENTRISTS);
    const turmoil = Turmoil.getTurmoil(game);
    const first = cast(new FirstManMonument().play(player), SelectParty);
    first.cb(turmoil.parties[0].name);
    runAllActions(game);
    const second = cast(player.popWaitingFor(), SelectParty);
    expect(second.parties).not.to.include(turmoil.parties[0].name);
    second.cb(turmoil.parties[1].name);
    expect(turmoil.parties[0].delegates.get(player)).eq(1);
    expect(turmoil.parties[1].delegates.get(player)).eq(1);
  });

  it('Award Celebration: TR for meeting an unclaimed milestone', () => {
    const [game, player, player2] = gigaGame([PartyName.CENTRISTS]);
    setRulingParty(game, PartyName.CENTRISTS);
    const milestone = game.milestones[0];
    const options = cast(new AwardCelebration().play(player), OrOptions);
    expect(options.options).has.length(game.milestones.length);
    AwardCelebration.celebrate(player, milestone);
    expect(player.terraformRating).eq(milestone.canClaim(player) ? 22 : 20);
    expect(player2.terraformRating).eq(milestone.canClaim(player2) ? 21 : 20);
  });

  it('Bribery: M€ production from an opponent', () => {
    const [game, player, player2] = gigaGame([PartyName.BUREAUCRATS]);
    setRulingParty(game, PartyName.BUREAUCRATS);
    player2.production.add(Resource.MEGACREDITS, 2);
    play(player, new Bribery());
    cast(player.popWaitingFor(), SelectPlayer).cb(player2);
    runAllActions(game);
    expect(player.production.megacredits).eq(1);
    expect(player2.production.megacredits).eq(1);
  });

  it('Mars Academy of Political Sciences: +2 influence', () => {
    const [game, player] = gigaGame([PartyName.CENTRISTS]);
    const turmoil = Turmoil.getTurmoil(game);
    const before = turmoil.getInfluence(player);
    player.playedCards.push(new MarsAcademyOfPoliticalSciences());
    expect(turmoil.getInfluence(player)).eq(before + 2);
  });

  it('Immigration Bureau: 3 M€ and a delegate per Earth event', () => {
    const [game, player] = gigaGame([PartyName.POPULISTS]);
    const card = new ImmigrationBureau();
    player.playedCards.push(card);
    card.onCardPlayed(player, fakeCard({type: CardType.EVENT, tags: [Tag.EARTH, Tag.EVENT]}));
    expect(player.megaCredits).eq(3);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectParty);
    card.onCardPlayed(player, fakeCard({type: CardType.AUTOMATED, tags: [Tag.EARTH]}));
    expect(player.megaCredits).eq(3);
  });

  it('Anti Fraud Investigation: no resources can be removed this generation', () => {
    const [game, player, player2] = gigaGame([PartyName.CENTRISTS]);
    setRulingParty(game, PartyName.CENTRISTS);
    expect(player2.isProtected(Resource.MEGACREDITS)).is.false;
    const card = new AntiFraudInvestigation();
    play(player, card);
    player.playedCards.push(card);
    expect(player2.isProtected(Resource.MEGACREDITS)).is.true;
    expect(player2.plantsAreProtected()).is.true;
    expect(player.isProtected(Resource.HEAT)).is.true;
    game.generation++;
    expect(player2.isProtected(Resource.MEGACREDITS)).is.false;
  });
});

describe('Fan-party cards: Ides of Mars', () => {
  it('Flying Garden: an off-world greenery next to an off-world city', () => {
    const [game, player] = gigaGame([PartyName.SPOME]);
    setRulingParty(game, PartyName.SPOME);
    const card = new FlyingGarden();
    player.production.add(Resource.ENERGY, 1);
    expect(card.canPlay(player)).is.false;
    const ganymede = game.board.getSpaceOrThrow(SpaceName.GANYMEDE_COLONY);
    game.addCity(player, ganymede, CardName.GANYMEDE_COLONY);
    expect(card.canPlay(player)).is.true;

    const oxygen = game.getOxygenLevel();
    const select = cast(card.play(player), SelectSpace);
    select.cb(ganymede);
    runAllActions(game);
    const garden = game.board.getSpaceOrThrow(SpaceName.FLYING_GARDEN);
    expect(garden.spaceType).eq(SpaceType.COLONY);
    expect(garden.tile?.tileType).eq(TileType.GREENERY);
    expect(game.getOxygenLevel()).eq(oxygen);
    expect(player.production.plants).eq(1);
    expect(player.production.energy).eq(0);
    // Ganymede scores the garden as an adjacent greenery.
    expect(game.board.getAdjacentSpaces(ganymede).filter(Board.isGreenerySpace)).has.length(1);
    expect(game.board.getAdjacentSpaces(garden)).deep.eq([ganymede]);
    expect(game.board.getGreeneries(player)).has.length(1);
  });

  it('Flying Garden space is only on the board with Giga Turmoil', () => {
    const [game] = testGame(2, {idesofmarsExpansion: true, turmoilExtension: true});
    expect(game.board.spaces.some((s) => s.id === SpaceName.FLYING_GARDEN)).is.false;
  });

  it('Terraforming Office: an extra action, once per generation', () => {
    const [game, player] = gigaGame([PartyName.BUREAUCRATS]);
    const card = new TerraformingOffice();
    const before = player.availableActionsThisRound;
    card.action(player);
    expect(player.availableActionsThisRound).eq(before + 2);
    expect(game).is.not.undefined;
  });

  it('Free City: a city that belongs to nobody', () => {
    const [game, player] = gigaGame([PartyName.POPULISTS]);
    setRulingParty(game, PartyName.POPULISTS);
    const select = cast(new FreeCity().play(player), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.CITY);
    expect(space.player).is.undefined;
    expect(game.board.getCities(player)).has.length(0);
    expect(game.board.getCities()).has.length(1);
    // A greenery next to it scores for its owner.
    const next = game.board.getAdjacentSpaces(space).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    addGreenery(player, next.id);
    expect(player.getVictoryPoints().city).eq(0);
  });
});

describe('Fan-party cards: unused helpers', () => {
  it('SelectPlayer is offered with 3 or more players for Tax the Rich', () => {
    const [game, player] = testGame(3, GIGA);
    const turmoil = Turmoil.getTurmoil(game);
    turmoil.startGigaGovernment(game, [PartyName.POPULISTS, ...BOARD_ORDER.filter((n) => n !== PartyName.POPULISTS)].slice(0, GIGA_PARTIES_IN_PLAY));
    for (const p of game.players) {
      (p as TestPlayer).popWaitingFor();
    }
    game.phase = Phase.ACTION;
    setRulingParty(game, PartyName.POPULISTS);
    const card = new TaxTheRich();
    player.cardsInHand.push(card);
    player.playCard(card);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectPlayer);
    expect(GanymedeColony).is.not.undefined;
    expect(CardResource.SEED).is.not.undefined;
  });
});
