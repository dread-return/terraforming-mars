import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {addCity, addGreenery, addOcean, fakeCard, runAllActions, setOxygenLevel, setTemperature, setVenusScaleLevel} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {EPIC_CARD_MANIFEST} from '../../../src/server/cards/epic/EpicCardManifest';
import {GameCards} from '../../../src/server/GameCards';
import {DEFAULT_GAME_OPTIONS, GameOptions} from '../../../src/server/game/GameOptions';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';
import {Units} from '../../../src/common/Units';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {isIActionCard} from '../../../src/server/cards/ICard';
import {autoRespond} from './autoRespond';
import {Biome} from '../../../src/server/cards/epic/Biome';
import {Aquatix} from '../../../src/server/cards/epic/Aquatix';
import {CollinsRubinAndHaytham} from '../../../src/server/cards/epic/CollinsRubinAndHaytham';
import {CoreConductionSystems} from '../../../src/server/cards/epic/CoreConductionSystems';
import {ExtrasolarColonizationAdministration} from '../../../src/server/cards/epic/ExtrasolarColonizationAdministration';
import {EyeInTheSky} from '../../../src/server/cards/epic/EyeInTheSky';
import {Genecraft} from '../../../src/server/cards/epic/Genecraft';
import {Hydrodynamics} from '../../../src/server/cards/epic/Hydrodynamics';
import {PlanetaryHomeostasisBureau} from '../../../src/server/cards/epic/PlanetaryHomeostasisBureau';
import {BarsoomianAtmospherics} from '../../../src/server/cards/epic/BarsoomianAtmospherics';
import {SoukaiSyndicate} from '../../../src/server/cards/epic/SoukaiSyndicate';
import {SymbioticSystems} from '../../../src/server/cards/epic/SymbioticSystems';
import {MarsActiveResources} from '../../../src/server/cards/epic/MarsActiveResources';
import {Leviathan} from '../../../src/server/cards/epic/Leviathan';
import {RedShip} from '../../../src/server/cards/epic/RedShip';
import {CriticalHitEnterprises} from '../../../src/server/cards/epic/CriticalHitEnterprises';
import {WeylandYutaniCorp} from '../../../src/server/cards/epic/WeylandYutaniCorp';
import {Troidco} from '../../../src/server/cards/epic/Troidco';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {IStandardProjectCard} from '../../../src/server/cards/IStandardProjectCard';
import {GlobalParameter} from '../../../src/common/GlobalParameter';

function corpNames(options: Partial<GameOptions>): Array<CardName> {
  return new GameCards({...DEFAULT_GAME_OPTIONS, ...options}).getCorporationCards().map((c) => c.name);
}

function playCorp(player: TestPlayer, corp: ICorporationCard) {
  player.playCorporationCard(corp);
  runAllActions(player.game);
}

describe('Epic Corporations', () => {
  describe('Corporate Era gating', () => {
    it('are in the deck with Corporate Era, and not without it', () => {
      expect(corpNames({corporateEra: true})).to.include(CardName.BIOME);
      expect(corpNames({corporateEra: false})).to.not.include(CardName.BIOME);
    });

    it('corps that need another expansion only join with it', () => {
      const plain = corpNames({corporateEra: true});
      expect(plain).to.not.include(CardName.HARBINGER);
      expect(plain).to.not.include(CardName.LOBOS_DEL_CIELO);
      expect(plain).to.not.include(CardName.TEPCO);
      expect(plain).to.not.include(CardName.GALACTICER);

      const full = corpNames({corporateEra: true, coloniesExtension: true, venusNextExtension: true, nuclearExpansion: true, solarisExpansion: true});
      expect(full).to.include.members([CardName.HARBINGER, CardName.LOBOS_DEL_CIELO, CardName.TEPCO, CardName.GALACTICER]);
    });

    it('every Epic corp is listed under the Corporate Era module', () => {
      expect(EPIC_CARD_MANIFEST.module).eq('corpera');
    });
  });

  it('Biome: 2 M€ per plant/microbe/animal tag', () => {
    const [/* game */, player] = testGame(2);
    const biome = new Biome();
    playCorp(player, biome);
    const mc = player.megaCredits;
    player.playCard(fakeCard({tags: [Tag.PLANT, Tag.ANIMAL, Tag.SPACE]}));
    expect(player.megaCredits - mc).eq(4);
  });

  it('Aquatix: oceans by anyone raise M€ production; ocean requirements ±2', () => {
    const [/* game */, player, other] = testGame(2);
    const aquatix = new Aquatix();
    playCorp(player, aquatix);
    addOcean(other);
    expect(player.production.megacredits).eq(1);
    expect(aquatix.getGlobalParameterRequirementBonus(player, GlobalParameter.OCEANS)).eq(2);
    expect(aquatix.getGlobalParameterRequirementBonus(player, GlobalParameter.OXYGEN)).eq(0);
  });

  it('Collins, Rubin & Haytham: cards cost 2 to buy', () => {
    const [/* game */, player] = testGame(2);
    playCorp(player, new CollinsRubinAndHaytham());
    expect(player.cardCost).eq(2);
  });

  it('Core Conduction Systems: production gains also give resources', () => {
    const [/* game */, player] = testGame(2);
    playCorp(player, new CoreConductionSystems());
    expect(player.heat).eq(2);
    player.production.add(Resource.ENERGY, 3);
    expect(player.energy).eq(3);
  });

  it('Extrasolar Colonization Administration: 3 M€ after a standard project except selling patents', () => {
    const [/* game */, player] = testGame(2);
    const eca = new ExtrasolarColonizationAdministration();
    playCorp(player, eca);
    const mc = player.megaCredits;
    eca.onStandardProject(player, {name: CardName.SELL_PATENTS_STANDARD_PROJECT} as IStandardProjectCard);
    expect(player.megaCredits).eq(mc);
    eca.onStandardProject(player, {name: CardName.POWER_PLANT_STANDARD_PROJECT} as IStandardProjectCard);
    expect(player.megaCredits).eq(mc + 3);
  });

  it('Eye in the Sky: 3 M€ per planetary tag and VP per full set', () => {
    const [/* game */, player] = testGame(2);
    const eye = new EyeInTheSky();
    playCorp(player, eye);
    const mc = player.megaCredits;
    player.playCard(fakeCard({tags: [Tag.MOON, Tag.VENUS, Tag.MARS, Tag.JOVIAN]}));
    expect(player.megaCredits - mc).eq(12);
    expect(eye.getVictoryPoints(player)).eq(1);
  });

  it('Genecraft: any player\'s microbe tag raises M€ production', () => {
    const [/* game */, player, other] = testGame(2);
    playCorp(player, new Genecraft());
    other.playCard(fakeCard({tags: [Tag.MICROBE]}));
    expect(player.production.megacredits).eq(1);
  });

  it('Hydrodynamics: ocean adjacency bonus is 4 M€', () => {
    const [/* game */, player] = testGame(2);
    playCorp(player, new Hydrodynamics());
    expect(player.oceanBonus).eq(4);
    addOcean(player);
    expect(player.production.energy).eq(1);
  });

  it('Planetary Homeostasis Bureau: temperature raised by anyone', () => {
    const [game, player, other] = testGame(2);
    playCorp(player, new PlanetaryHomeostasisBureau());
    game.increaseTemperature(other, 2);
    expect(player.production.megacredits).eq(2);
  });

  it('Barsoomian Atmospherics: oxygen by anyone, energy only for you', () => {
    const [game, player, other] = testGame(2);
    playCorp(player, new BarsoomianAtmospherics());
    const mc = player.megaCredits;
    game.increaseOxygenLevel(other, 1);
    expect(player.megaCredits).eq(mc + 2);
    expect(player.energy).eq(0);
    game.increaseOxygenLevel(player, 1);
    expect(player.energy).eq(2);
  });

  it('Soukai Syndicate: -10 TR, then TR counts x1.5 for income', () => {
    const [/* game */, player] = testGame(2);
    const tr = player.terraformRating;
    playCorp(player, new SoukaiSyndicate());
    expect(player.terraformRating).eq(tr - 10);
    const mc = player.megaCredits;
    player.finishProductionPhase();
    expect(player.megaCredits - mc).eq(player.terraformRating + Math.floor(player.terraformRating / 2));
  });

  it('Symbiotic Systems: 1 M€ off Earth/Venus/Jovian cards, VP per set', () => {
    const [/* game */, player] = testGame(2);
    const corp = new SymbioticSystems();
    playCorp(player, corp);
    expect(corp.getCardDiscount(player, fakeCard({tags: [Tag.EARTH]}))).eq(1);
    expect(corp.getCardDiscount(player, fakeCard({tags: [Tag.SCIENCE]}))).eq(0);
    player.playedCards.push(fakeCard({tags: [Tag.VENUS, Tag.JOVIAN]}));
    expect(corp.getVictoryPoints(player)).eq(1);
  });

  it('M.A.R.S.: 2 M€ for blue cards, 1 M€ for blue card actions', () => {
    const [/* game */, player] = testGame(2);
    playCorp(player, new MarsActiveResources());
    const mc = player.megaCredits;
    player.playCard(fakeCard({type: CardType.ACTIVE}));
    expect(player.megaCredits).eq(mc + 2);
  });

  it('Leviathan: looks at 5 research cards', () => {
    const [/* game */, player] = testGame(2);
    playCorp(player, new Leviathan());
    player.runResearchPhase();
    const input = player.popWaitingFor();
    expect(JSON.stringify(input?.toModel(player))).to.include('"max":5');
  });

  it('Red Ship: 2 M€ per city or special tile next to an ocean', () => {
    const [game, player, other] = testGame(2);
    const corp = new RedShip();
    playCorp(player, corp);
    expect(corp.canAct(player)).is.false;
    const ocean = addOcean(other);
    const next = game.board.getAdjacentSpaces(ocean).find((s) => s.tile === undefined && s.spaceType === 'land');
    if (next !== undefined) {
      addCity(other, next.id);
      expect(RedShip.count(player)).eq(1);
    }
  });

  it('Critical Hit Enterprises: asteroid project costs a higher-TR player 1 TR', () => {
    const [/* game */, player, other] = testGame(2);
    const corp = new CriticalHitEnterprises();
    playCorp(player, corp);
    other.setTerraformRating(player.terraformRating + 3);
    const tr = other.terraformRating;
    corp.onStandardProject(player, {name: CardName.ASTEROID_STANDARD_PROJECT} as IStandardProjectCard);
    runAllActions(player.game);
    const input = player.popWaitingFor();
    if (input instanceof SelectPlayer) {
      input.cb(other);
    }
    expect(other.terraformRating).eq(tr - 1);
  });

  it('Weyland-Yutani: 2 M€ for any science tag', () => {
    const [/* game */, player, other] = testGame(2);
    playCorp(player, new WeylandYutaniCorp());
    const mc = player.megaCredits;
    other.playCard(fakeCard({tags: [Tag.SCIENCE]}));
    expect(player.megaCredits).eq(mc + 2);
  });

  it('Troidco: steel and M€ into titanium', () => {
    const [/* game */, player] = testGame(2);
    const corp = new Troidco();
    playCorp(player, corp);
    player.stock.add(Resource.STEEL, 3);
    player.stock.add(Resource.TITANIUM, 1);
    const options = cast(corp.action(player), OrOptions);
    const amount = cast(options.options[0].cb(undefined), SelectAmount);
    amount.cb(2);
    expect(player.titanium).eq(3);
    expect(player.steel).eq(1);
  });
});

function richGame(): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, {
    corporateEra: true,
    venusNextExtension: true, coloniesExtension: true, preludeExtension: true,
    nuclearExpansion: true, solarisExpansion: true, promoCardsOption: true,
  });
  setTemperature(game, 0);
  setOxygenLevel(game, 8);
  setVenusScaleLevel(game, 20);
  addOcean(player);
  addGreenery(player);
  addCity(other);
  addCity(player);
  for (const p of [player, other]) {
    p.stock.add(Resource.MEGACREDITS, 200);
    p.stock.adjust(Units.of({steel: 20, titanium: 20, plants: 20, energy: 20, heat: 30}));
    p.production.adjust(Units.of({megacredits: 5, steel: 3, titanium: 3, plants: 3, energy: 3, heat: 3}));
  }
  game.projectDeck.discard(game.projectDeck.drawOrThrow(game));
  return [game, player, other];
}

describe('Epic Corporations smoke test: every corp plays, takes its first action and acts', () => {
  const corps = Object.values(EPIC_CARD_MANIFEST.corporationCards).map((f) => new f!.Factory());
  for (const corp of corps) {
    it(corp.name, () => {
      const [game, player] = richGame();
      expect(corp.metadata.renderData).is.instanceOf(Object);
      player.playCorporationCard(corp);
      autoRespond(game, player);
      if (corp.initialAction !== undefined && corp.initialActionText !== undefined) {
        autoRespond(game, player, corp.initialAction(player));
      }
      if (isIActionCard(corp) && corp.canAct(player)) {
        autoRespond(game, player, corp.action(player));
      }
      corp.getVictoryPoints(player);
    });
  }
});
