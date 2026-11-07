import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {addCity, fakeCard, maxOutOceans, runAllActions, setOxygenLevel, setTemperature} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {Resource} from '../../../src/common/Resource';
import {CardType} from '../../../src/common/cards/CardType';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Fish} from '../../../src/server/cards/base/Fish';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {resolve} from './resolve';
import {RadiationShielding} from '../../../src/server/cards/nuclear/RadiationShielding';
import {Retrovirus} from '../../../src/server/cards/nuclear/Retrovirus';
import {StorageSite} from '../../../src/server/cards/nuclear/StorageSite';
import {OxygenGardens} from '../../../src/server/cards/nuclear/OxygenGardens';
import {Caracals} from '../../../src/server/cards/nuclear/Caracals';
import {EnergizingLava} from '../../../src/server/cards/nuclear/EnergizingLava';
import {NuclearMartianSummit} from '../../../src/server/cards/nuclear/NuclearMartianSummit';
import {RefugeesRoundup} from '../../../src/server/cards/nuclear/RefugeesRoundup';
import {WasteDisposalTax} from '../../../src/server/cards/nuclear/WasteDisposalTax';
import {PlanetX} from '../../../src/server/cards/nuclear/PlanetX';
import {InfraredTherapy} from '../../../src/server/cards/nuclear/InfraredTherapy';
import {StellarNova} from '../../../src/server/cards/nuclear/StellarNova';
import {FalseFlagOperations} from '../../../src/server/cards/nuclear/FalseFlagOperations';
import {MirrorHeatExchangers} from '../../../src/server/cards/nuclear/MirrorHeatExchangers';
import {MissileDefenseMatrix} from '../../../src/server/cards/nuclear/MissileDefenseMatrix';
import {JovianMegaResearchBay} from '../../../src/server/cards/nuclear/JovianMegaResearchBay';
import {OberonTradingStation} from '../../../src/server/cards/nuclear/OberonTradingStation';
import {ProcessedTitanium} from '../../../src/server/cards/nuclear/ProcessedTitanium';
import {ExplorationMiningSite} from '../../../src/server/cards/nuclear/ExplorationMiningSite';
import {IonBeamMedicalFacility} from '../../../src/server/cards/nuclear/IonBeamMedicalFacility';
import {GenomicNucleationCentre} from '../../../src/server/cards/nuclear/GenomicNucleationCentre';
import {FreeRadicals} from '../../../src/server/cards/nuclear/FreeRadicals';
import {EMFConnection} from '../../../src/server/cards/nuclear/EMFConnection';
import {WasteBurial} from '../../../src/server/cards/nuclear/WasteBurial';
import {ArtificialSun} from '../../../src/server/cards/nuclear/ArtificialSun';
import {EliteCommandBase} from '../../../src/server/cards/nuclear/EliteCommandBase';
import {CallistoFieldArrays} from '../../../src/server/cards/nuclear/CallistoFieldArrays';
import {UraniumMine} from '../../../src/server/cards/nuclear/UraniumMine';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {cast} from '../../../src/common/utils/utils';

function setup(options = {}): [IGame, TestPlayer, TestPlayer, RadiationShielding] {
  const [game, player, opponent] = testGame(2, {nuclearExpansion: true, ...options});
  const holder = new RadiationShielding();
  player.playedCards.push(holder);
  return [game, player, opponent, holder];
}

describe('Nuclear cards 57-78 and preludes', () => {
  it('Retrovirus: any microbe tag adds a microbe or radiation, including this', () => {
    const [, player, opponent, holder] = setup();
    const card = new Retrovirus();
    const tardigrades = new Tardigrades();
    player.playedCards.push(card, tardigrades);
    card.onCardPlayedByAnyPlayer(player, fakeCard({tags: [Tag.MICROBE]}));
    resolve(player, {or: [1]});
    expect(holder.resourceCount).eq(1);
    card.onCardPlayedByAnyPlayer(player, card);
    resolve(player, {or: [0]});
    expect(tardigrades.resourceCount).eq(1);
    expect(opponent).is.not.undefined;
  });

  it('Storage Site: discard on play; draw and add radiation, or spend 2 to draw 2', () => {
    const [, player] = setup();
    const card = new StorageSite();
    player.cardsInHand.push(fakeCard(), fakeCard());
    card.play(player);
    resolve(player);
    expect(player.cardsInHand).has.length(1);
    card.resourceCount = 2;
    player.playedCards.push(card);
    card.action(player);
    resolve(player, {or: [1]});
    expect(player.cardsInHand).has.length(3);
    expect(card.resourceCount).eq(0);
  });

  it('Oxygen Gardens and Caracals', () => {
    const [game, player, opponent] = setup();
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    new OxygenGardens().play(player);
    resolve(player);
    expect(game.getOxygenLevel()).eq(1);
    expect(player.plants).eq(1);
    expect(tardigrades.resourceCount).eq(1);

    const caracals = new Caracals();
    setOxygenLevel(game, 10);
    opponent.playedCards.push(fakeCard({tags: [Tag.ANIMAL]}));
    const fish = new Fish();
    player.playedCards.push(fish);
    caracals.play(player);
    resolve(player);
    // Fish + opponent's animal + Caracals itself
    expect(player.megaCredits).eq(3);
    expect(fish.resourceCount).eq(2);
  });

  it('Energizing Lava: at most 4 radioactive tags', () => {
    const [, player] = setup();
    const card = new EnergizingLava();
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE, Tag.RADIOACTIVE, Tag.RADIOACTIVE]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE]}));
    expect(card.canPlay(player)).is.false;
  });

  it('Nuclear Martian Summit: this generation only', () => {
    const [game, player] = setup();
    const card = new NuclearMartianSummit();
    card.play(player);
    player.playedCards.push(card);
    expect(player.getCardCost(fakeCard({cost: 10}))).eq(9);
    expect(player.getCardCost(fakeCard({cost: 10, type: CardType.EVENT}))).eq(8);
    game.generation++;
    expect(player.getCardCost(fakeCard({cost: 10}))).eq(10);
  });

  it('Refugees Roundup: steal titanium or steel, remove radiation', () => {
    const [, player, opponent] = setup();
    const card = new RefugeesRoundup();
    expect(card.canPlay(player)).is.false;
    addCity(opponent);
    expect(card.canPlay(player)).is.true;
    opponent.titanium = 2;
    const theirs = new RadiationShielding();
    theirs.resourceCount = 1;
    opponent.playedCards.push(theirs);
    card.play(player);
    resolve(player, {player: opponent, card: (cards) => cards.findIndex((c) => c === theirs)});
    expect(player.titanium).eq(1);
    expect(theirs.resourceCount).eq(0);
  });

  it('Waste Disposal Tax: pay each opponent 1 M€', () => {
    const [, player, opponent, holder] = setup();
    player.megaCredits = 5;
    new WasteDisposalTax().play(player);
    resolve(player);
    expect(player.megaCredits).eq(4);
    expect(opponent.megaCredits).eq(1);
    expect(holder.resourceCount).eq(1);
    expect(player.cardsInHand).has.length(1);
  });

  it('Planet X: heat per 2 space tags', () => {
    const [, player, , holder] = setup();
    const card = new PlanetX();
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE, Tag.RADIOACTIVE, Tag.SPACE, Tag.SPACE]}));
    expect(card.canPlay(player)).is.true;
    const tr = player.terraformRating;
    card.play(player);
    resolve(player);
    expect(player.terraformRating).eq(tr + 1);
    // Fake card's 2 space + Radiation Shielding's 1 + Planet X's 1 = 4.
    expect(player.heat).eq(2);
    expect(holder.resourceCount).eq(2);
  });

  it('Infrared Therapy: spends steel and titanium', () => {
    const [, player] = setup();
    const card = new InfraredTherapy();
    player.production.add(Resource.HEAT, 4);
    player.steel = 1;
    player.titanium = 2;
    expect(card.canPlay(player)).is.true;
    const tr = player.terraformRating;
    card.play(player);
    expect(player.steel).eq(0);
    expect(player.titanium).eq(0);
    expect(player.heat).eq(4);
    expect(player.terraformRating).eq(tr + 2);
  });

  it('Stellar Nova: removes an ocean (icon), raises temperature', () => {
    const [game, player, , holder] = setup();
    maxOutOceans(player, 2);
    const card = new StellarNova();
    expect(card.canPlay(player)).is.true;
    card.play(player);
    resolve(player);
    expect(game.board.getOceanSpaces()).has.length(1);
    expect(game.getTemperature()).eq(-28);
    expect(player.titanium).eq(2);
    expect(holder.resourceCount).eq(1);
  });

  it('False Flag Operations: needs 15 tags; action marks a tag', () => {
    const [, player] = setup();
    const card = new FalseFlagOperations();
    // Radiation Shielding already gives 2 tags.
    player.playedCards.push(fakeCard({tags: Array(12).fill(Tag.EARTH)}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    player.defer(card.action(player));
    resolve(player, {or: [4]});
    expect(card.data.tag).eq(Tag.EARTH);
  });

  it('Mirror Heat Exchangers: radiation for M€ per radioactive tag', () => {
    const [game, player, opponent] = setup();
    const card = new MirrorHeatExchangers();
    setTemperature(game, -20);
    expect(card.canPlay(player)).is.true;
    const theirs = new RadiationShielding();
    theirs.resourceCount = 1;
    opponent.playedCards.push(theirs);
    player.playedCards.push(card);
    expect(card.canAct(player)).is.true;
    player.defer(card.action(player));
    resolve(player);
    expect(theirs.resourceCount).eq(0);
    // Radiation Shielding + Mirror Heat Exchangers
    expect(player.megaCredits).eq(2);
  });

  it('Missile Defense Matrix: draw per 2 radioactive tags', () => {
    const [game, player] = setup();
    const card = new MissileDefenseMatrix();
    card.play(player);
    resolve(player);
    expect(game.getTemperature()).eq(-28);
    expect(player.cardsInHand).has.length(1);
  });

  it('Jovian Mega Research Bay: draw on radioactive cards; titanium for a card', () => {
    const [, player] = setup();
    const card = new JovianMegaResearchBay();
    card.onCardPlayed(player, new UraniumMine());
    expect(player.cardsInHand).has.length(1);
    player.titanium = 1;
    player.playedCards.push(card);
    card.action(player);
    resolve(player);
    expect(player.cardsInHand).has.length(2);
  });

  it('Oberon Trading Station: trade fleet', () => {
    const [, player] = setup({coloniesExtension: true});
    const card = new OberonTradingStation();
    player.production.add(Resource.STEEL, 1);
    player.playedCards.push(fakeCard({tags: [Tag.SPACE, Tag.SPACE, Tag.SPACE, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN]}));
    expect(card.canPlay(player)).is.true;
    const fleets = player.colonies.getFleetSize();
    card.play(player);
    expect(player.colonies.getFleetSize()).eq(fleets + 1);
    expect(player.production.megacredits).eq(4);
  });

  it('Processed Titanium: M€ production into titanium production', () => {
    const [, player] = setup();
    const card = new ProcessedTitanium();
    card.play(player);
    player.playedCards.push(card);
    card.action(player);
    resolve(player, {or: [1]});
    expect(player.production.megacredits).eq(0);
    expect(player.production.titanium).eq(1);
  });

  it('Exploration Mining Site', () => {
    const [game, player, , holder] = setup();
    const card = new ExplorationMiningSite();
    setTemperature(game, -12);
    expect(card.canPlay(player)).is.false;
    setTemperature(game, -14);
    card.play(player);
    resolve(player);
    expect(player.production.steel).eq(2);
    expect(player.cardsInHand).has.length(2);
    expect(holder.resourceCount).eq(1);
  });

  it('Ion Beam Medical Facility: 4 microbes turn into heat production', () => {
    const [, player] = setup();
    const card = new IonBeamMedicalFacility();
    player.playedCards.push(card);
    card.resourceCount = 2;
    card.onCardPlayed(player, fakeCard({tags: [Tag.SCIENCE, Tag.RADIOACTIVE]}));
    expect(card.resourceCount).eq(0);
    expect(player.production.heat).eq(1);
  });

  it('Genomic Nucleation Centre', () => {
    const [, player] = setup();
    const card = new GenomicNucleationCentre();
    player.playedCards.push(card);
    card.resourceCount = 3;
    card.action(player);
    resolve(player, {or: [1]});
    expect(card.resourceCount).eq(0);
    expect(player.megaCredits).eq(2);
    expect(player.cardsInHand).has.length(1);
  });

  it('Free Radicals: radiation for a card', () => {
    const [, player] = setup();
    const card = new FreeRadicals();
    card.play(player);
    resolve(player);
    expect(player.cardsInHand).has.length(1);
    card.resourceCount = 1;
    player.playedCards.push(card);
    card.action(player);
    resolve(player);
    expect(player.cardsInHand).has.length(2);
  });

  it('EMF Connection: plays an event 11 M€ cheaper', () => {
    const [game, player] = setup({preludeExtension: true});
    const card = new EMFConnection();
    const event = fakeCard({cost: 12, type: CardType.EVENT});
    player.cardsInHand.push(event);
    player.megaCredits = 1;
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectProjectCardToPlay);
    expect(select.cards.map((c) => c.name)).deep.eq([event.name]);
    expect(player.getCardCost(event)).eq(1);
  });

  it('Callisto Field Arrays: plays a Jovian card 7 M€ cheaper', () => {
    const [game, player] = setup({preludeExtension: true});
    const card = new CallistoFieldArrays();
    const jovian = fakeCard({cost: 10, tags: [Tag.JOVIAN]});
    player.cardsInHand.push(jovian, fakeCard({cost: 1}));
    player.megaCredits = 3;
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectProjectCardToPlay);
    expect(select.cards.map((c) => c.name)).deep.eq([jovian.name]);
    expect(player.titanium).eq(3);
  });

  it('Waste Burial: 4 radiation move to the first radiation card played', () => {
    const [game, player] = setup({preludeExtension: true});
    const card = new WasteBurial();
    const tr = player.terraformRating;
    player.playCard(card);
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 1);
    expect(player.production.steel).eq(1);
    const lava = new EnergizingLava();
    player.playCard(lava);
    runAllActions(game);
    expect(lava.resourceCount).eq(4);
    expect(card.data.waiting).eq(0);
  });

  it('Artificial Sun and Elite Command Base', () => {
    const [game, player] = setup({preludeExtension: true});
    new ArtificialSun().play(player);
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(player.cardsInHand.every((c) => c.resourceType === 'Radiation')).is.true;
    expect(player.production.heat).eq(1);
    new EliteCommandBase().play(player);
    expect(player.production.megacredits).eq(1);
    expect(player.megaCredits).eq(3);
  });
});
