import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, fakeCard, runAllActions, setTemperature} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {ETERNITY_CARD_MANIFEST} from '../../../src/server/cards/eternity/EternityCardManifest';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {Resource} from '../../../src/common/Resource';
import {Units} from '../../../src/common/Units';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {AstralBog} from '../../../src/server/cards/eternity/AstralBog';
import {ExoplanetBuilders} from '../../../src/server/cards/eternity/ExoplanetBuilders';
import {MarsConservationists} from '../../../src/server/cards/eternity/MarsConservationists';
import {ResourceGarrison} from '../../../src/server/cards/eternity/ResourceGarrison';
import {ProjectWhammy} from '../../../src/server/cards/eternity/ProjectWhammy';
import {EarthsLastCityRebuilt} from '../../../src/server/cards/eternity/EarthsLastCityRebuilt';
import {PatentValuationAdjustment} from '../../../src/server/cards/eternity/PatentValuationAdjustment';
import {NewThorgate} from '../../../src/server/cards/eternity/NewThorgate';
import {InterstellaProject} from '../../../src/server/cards/eternity/InterstellaProject';
import {TransactionNetwork} from '../../../src/server/cards/eternity/TransactionNetwork';
import {Dolphins} from '../../../src/server/cards/eternity/Dolphins';
import {HeavyMiner} from '../../../src/server/cards/eternity/HeavyMiner';
import {TerraMars} from '../../../src/server/cards/eternity/TerraMars';
import {LiveOffTheLand} from '../../../src/server/cards/eternity/LiveOffTheLand';
import {MiningSponsors} from '../../../src/server/cards/eternity/MiningSponsors';
import {SteelCityOnMars} from '../../../src/server/cards/eternity/SteelCityOnMars';
import {ScienceMission} from '../../../src/server/cards/eternity/ScienceMission';
import {MechanizedWorldMaker} from '../../../src/server/cards/eternity/MechanizedWorldMaker';
import {SellPatentsStandardProject} from '../../../src/server/cards/base/standardProjects/SellPatentsStandardProject';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {AquiferStandardProject} from '../../../src/server/cards/base/standardProjects/AquiferStandardProject';
import {WingspearsCorp} from '../../../src/server/cards/eternity/WingspearsCorp';
import {Vipers} from '../../../src/server/cards/eternity/Vipers';
import {MicroorganismMutation} from '../../../src/server/cards/eternity/MicroorganismMutation';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {ViralAmoeboid} from '../../../src/server/cards/eternity/ViralAmoeboid';
import {TharsisPrototypeCity} from '../../../src/server/cards/eternity/TharsisPrototypeCity';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';

describe('Eternity', () => {
  let game: IGame;
  let player: TestPlayer;
  let other: TestPlayer;

  beforeEach(() => {
    [game, player, other] = testGame(2, {eternityExpansion: true, preludeExtension: true});
  });

  describe('manifest and expansion gating', () => {
    const names = new Set<string>(Object.keys(ETERNITY_CARD_MANIFEST.projectCards));
    function inDeck(g: IGame) {
      return [...g.projectDeck.drawPile, ...g.players.flatMap((p) => p.dealtProjectCards)].map((c) => c.name).filter((n) => names.has(n));
    }

    it('no Eternity cards when the module is off', () => {
      const [g] = testGame(2, {venusNextExtension: true, coloniesExtension: true});
      expect(inDeck(g)).is.empty;
    });

    it('Venus cards need Venus Next, colony cards need Colonies', () => {
      const plain = inDeck(game);
      expect(plain).does.not.include(CardName.ATMOSPHERIC_VIABILITY_TESTING);
      expect(plain).does.not.include(CardName.PRIVATE_COLONY);
      expect(plain).does.not.include(CardName.THE_CRASH_OF_ELARA);
      expect(plain).does.not.include(CardName.RADIOACTIVE_ASTEROID);
      expect(plain).includes(CardName.DOLPHINS);
      const [all] = testGame(2, {eternityExpansion: true, venusNextExtension: true, coloniesExtension: true, nuclearExpansion: true});
      const full = inDeck(all);
      expect(full).includes(CardName.ATMOSPHERIC_VIABILITY_TESTING);
      expect(full).includes(CardName.PRIVATE_COLONY);
      expect(full).includes(CardName.RADIOACTIVE_ASTEROID);
      expect(full.length).eq(names.size - 1); // all but the Interstella project card
    });

    it('the Interstella project card never goes in the deck', () => {
      const [all] = testGame(2, {eternityExpansion: true, venusNextExtension: true, coloniesExtension: true});
      expect(inDeck(all)).does.not.include(CardName.INTERSTELLA_PROJECT);
    });
  });

  it('Astral Bog and Exoplanet Builders raise every player\'s card costs per tag', () => {
    const card = new SteelCityOnMars(); // 3 tags, cost 7
    expect(other.getCardCost(card)).eq(7);
    player.playedCards.push(new AstralBog());
    expect(other.getCardCost(card)).eq(10);
    player.playCorporationCard(new ExoplanetBuilders());
    expect(other.getCardCost(card)).eq(16);
  });

  it('Mars Conservationists: city cards and the City standard project cost 3 more; greeneries pay out', () => {
    const corp = new MarsConservationists();
    player.playCorporationCard(corp);
    player.megaCredits = 0;
    player.plants = 0;
    expect(other.getCardCost(new SteelCityOnMars())).eq(10);
    expect(new CityStandardProject().getAdjustedCost(other)).eq(28);
    addGreenery(other);
    expect(player.plants).eq(1);
    expect(player.megaCredits).eq(5);
  });

  it('Resource Garrison protects production and stock from opponents', () => {
    player.playedCards.push(new ResourceGarrison());
    player.production.add(Resource.STEEL, 2);
    expect(player.canHaveProductionReduced(Resource.STEEL, 1, other)).is.false;
    expect(player.canHaveProductionReduced(Resource.STEEL, 1, player)).is.true;
    expect(player.isProtected(Resource.MEGACREDITS)).is.true;
    expect(player.isProtected(Resource.HEAT)).is.false;
  });

  it('Project Whammy: science tags count as Jovian tags', () => {
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE]}));
    const whammy = new ProjectWhammy();
    player.playedCards.push(whammy);
    expect(player.tags.count(Tag.JOVIAN, 'raw')).eq(4); // Whammy's own Jovian and science + 2 science
    expect(whammy.getVictoryPoints(player)).eq(4);
  });

  it('Earth\'s Last City Rebuilt blocks city-tag cards', () => {
    player.megaCredits = 100;
    player.production.add(Resource.ENERGY, 2);
    const steelCity = new SteelCityOnMars();
    expect(steelCity.canPlay(player)).is.true;
    player.playedCards.push(new EarthsLastCityRebuilt());
    expect(steelCity.canPlay(player)).is.false;
  });

  it('Patent Valuation Adjustment: 2 M€ per patent sold', () => {
    player.playedCards.push(new PatentValuationAdjustment());
    player.cardsInHand.push(new Vipers(), new Dolphins());
    const sp = new SellPatentsStandardProject();
    cast(sp.action(player), SelectCard).cb([...player.cardsInHand]);
    expect(player.megaCredits).eq(4);
  });

  it('New Thorgate: 2 M€ whenever anyone increases energy production', () => {
    player.playCorporationCard(new NewThorgate());
    player.megaCredits = 0;
    other.production.add(Resource.ENERGY, 2);
    expect(player.megaCredits).eq(2);
    other.production.add(Resource.HEAT, 1);
    expect(player.megaCredits).eq(2);
  });

  it('Interstella ignores TR loss', () => {
    player.playedCards.push(new InterstellaProject());
    const tr = player.terraformRating;
    player.decreaseTerraformRating(2);
    expect(player.terraformRating).eq(tr);
  });

  it('Transaction Network collects a floater when anyone discards', () => {
    const tn = new TransactionNetwork();
    player.playedCards.push(tn);
    const card = new Vipers();
    other.cardsInHand.push(card);
    other.discardCardFromHand(card);
    expect(tn.resourceCount).eq(1);
  });

  it('Dolphins count anyone\'s temperature raises and oceans', () => {
    const dolphins = new Dolphins();
    player.playedCards.push(dolphins);
    setTemperature(game, -10);
    game.increaseTemperature(other, 1);
    expect(dolphins.resourceCount).eq(1);
    game.increaseTemperature(player, 1);
    expect(dolphins.resourceCount).eq(2);
  });

  it('Microorganism Mutation doubles microbes everywhere', () => {
    const tardigrades = new Tardigrades();
    other.playedCards.push(tardigrades);
    tardigrades.resourceCount = 3;
    const viral = new ViralAmoeboid();
    player.playedCards.push(viral);
    viral.resourceCount = 5;
    const tr = player.terraformRating;
    new MicroorganismMutation().play(player);
    expect(tardigrades.resourceCount).eq(6);
    expect(viral.resourceCount).eq(10);
    expect(player.terraformRating).eq(tr + 1);
  });

  it('Science Mission: titanium pays for science cards', () => {
    player.playedCards.push(new ScienceMission());
    const opts = (player as any).paymentOptionsForCard(new MechanizedWorldMaker());
    expect(opts.titanium).is.true;
  });

  it('Mechanized World Maker: steel pays for standard projects', () => {
    const aquifer = new AquiferStandardProject();
    player.steel = 9;
    player.megaCredits = 0;
    expect(aquifer.canAct(player)).is.false;
    player.playedCards.push(new MechanizedWorldMaker());
    expect(aquifer.canAct(player)).is.true;
  });

  it('Wingspears: the action after a greenery may ignore global requirements on an animal card', () => {
    const corp = new WingspearsCorp();
    player.playCorporationCard(corp);
    const birds = new Vipers(); // animal card, requires -2 °C
    player.megaCredits = 100;
    expect(birds.canPlay(player)).is.false;
    addGreenery(player);
    player.actionsTakenThisGame++;
    expect(birds.canPlay(player)).is.true;
    player.actionsTakenThisGame++;
    expect(birds.canPlay(player)).is.false;
  });

  it('Tharsis Prototype City skips the space bonus', () => {
    const card = new TharsisPrototypeCity();
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const space = select.spaces.find((s) => s.bonus.includes(SpaceBonus.STEEL) || s.bonus.includes(SpaceBonus.PLANT))!;
    const before = player.stock.asUnits();
    select.cb(space);
    runAllActions(game);
    expect(player.stock.asUnits()).deep.eq(before);
    expect(space.tile).is.not.undefined;
  });

  describe('double preludes', () => {
    it('discard your other prelude when played first', () => {
      const heavy = new HeavyMiner();
      const other = new MiningSponsors();
      player.preludeCardsInHand.push(heavy, other);
      player.playCard(heavy);
      runAllActions(game);
      expect(player.production.steel).eq(5);
      expect(player.preludeCardsInHand).is.empty;
      expect(game.preludeDeck.discardPile).includes(other);
    });

    it('as the last play, is discarded and the top prelude is played instead', () => {
      const terraMars = new TerraMars();
      player.preludeCardsInHand.push(terraMars);
      const top = new LiveOffTheLand();
      game.preludeDeck.drawPile.push(top);
      player.megaCredits = 20;
      const tr = player.terraformRating;
      player.playCard(terraMars);
      runAllActions(game);
      expect(player.terraformRating).eq(tr);
      expect(player.production.plants).eq(3);
      expect(player.playedCards.has(CardName.TERRA_MARS)).is.false;
      expect(game.preludeDeck.discardPile).includes(terraMars);
    });
  });

  it('Live Off the Land pays 12 M€', () => {
    player.megaCredits = 15;
    player.playCard(new LiveOffTheLand());
    runAllActions(game);
    expect(player.megaCredits).eq(3);
    expect(player.production.asUnits()).deep.eq(Units.of({plants: 3}));
  });
});
