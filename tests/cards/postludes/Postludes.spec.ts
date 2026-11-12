import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {addCity, addOcean, runAllActions, setOxygenLevel} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {Space} from '../../../src/server/boards/Space';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {TileType} from '../../../src/common/TileType';
import {CardName} from '../../../src/common/cards/CardName';
import {CardResource} from '../../../src/common/CardResource';
import {Tag} from '../../../src/common/cards/Tag';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectResources} from '../../../src/server/inputs/SelectResources';
import {Units} from '../../../src/common/Units';
import {Postludes} from '../../../src/server/postludes/Postludes';
import {POSTLUDE_CARD_NAMES} from '../../../src/common/postludes/Postludes';
import {PostludeCard} from '../../../src/server/cards/postludes/PostludeCard';
import {POSTLUDES_CARD_MANIFEST} from '../../../src/server/cards/postludes/PostludesCardManifest';
import {CardManifest} from '../../../src/server/cards/ModuleManifest';
import {calculateVictoryPoints} from '../../../src/server/game/calculateVictoryPoints';
import {IdesOfMars} from '../../../src/server/cards/idesofmars/IdesOfMars';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {GreeneryStandardProject} from '../../../src/server/cards/base/standardProjects/GreeneryStandardProject';
import {fakeCard} from '../../TestingUtils';
import {Payment} from '../../../src/common/inputs/Payment';
import {IProjectCard} from '../../../src/server/cards/IProjectCard';
import {Board} from '../../../src/server/boards/Board';

import {FlightAcademy} from '../../../src/server/cards/postludes/FlightAcademy';
import {CityProjectLibrary} from '../../../src/server/cards/postludes/CityProjectLibrary';
import {Asteroid} from '../../../src/server/cards/base/Asteroid';
import {AmusementPark} from '../../../src/server/cards/postludes/AmusementPark';
import {AnimalFarm} from '../../../src/server/cards/postludes/AnimalFarm';
import {AquaticLifeLaboratory} from '../../../src/server/cards/postludes/AquaticLifeLaboratory';
import {AstroUniversity} from '../../../src/server/cards/postludes/AstroUniversity';
import {BlackMarket} from '../../../src/server/cards/postludes/BlackMarket';
import {CultivationBiodome} from '../../../src/server/cards/postludes/CultivationBiodome';
import {DeepSeaMiningRig} from '../../../src/server/cards/postludes/DeepSeaMiningRig';
import {DeluxeWaterfrontResort} from '../../../src/server/cards/postludes/DeluxeWaterfrontResort';
import {FoodProcessingUnit} from '../../../src/server/cards/postludes/FoodProcessingUnit';
import {MachineryFactory} from '../../../src/server/cards/postludes/MachineryFactory';
import {MarineAquarium} from '../../../src/server/cards/postludes/MarineAquarium';
import {MarsCasino} from '../../../src/server/cards/postludes/MarsCasino';
import {MarsHospital} from '../../../src/server/cards/postludes/MarsHospital';
import {MetallurgyWorkshop} from '../../../src/server/cards/postludes/MetallurgyWorkshop';
import {MineralRefinery} from '../../../src/server/cards/postludes/MineralRefinery';
import {MiningDepot} from '../../../src/server/cards/postludes/MiningDepot';
import {NanoParticleFacility} from '../../../src/server/cards/postludes/NanoParticleFacility';
import {NationalGreenPark} from '../../../src/server/cards/postludes/NationalGreenPark';
import {PharmaceuticalCompany} from '../../../src/server/cards/postludes/PharmaceuticalCompany';
import {PhotobionicPowerStation} from '../../../src/server/cards/postludes/PhotobionicPowerStation';
import {PowerConverter} from '../../../src/server/cards/postludes/PowerConverter';
import {ProbioticsFacility} from '../../../src/server/cards/postludes/ProbioticsFacility';
import {ReDevelopmentOffice} from '../../../src/server/cards/postludes/ReDevelopmentOffice';
import {ScienceInstitute} from '../../../src/server/cards/postludes/ScienceInstitute';
import {SoilEnrichmentLab} from '../../../src/server/cards/postludes/SoilEnrichmentLab';
import {SportDivingSchool} from '../../../src/server/cards/postludes/SportDivingSchool';
import {UniversalBioStore} from '../../../src/server/cards/postludes/UniversalBioStore';
import {WasteProcessingCentre} from '../../../src/server/cards/postludes/WasteProcessingCentre';
import {SkyElevator} from '../../../src/server/cards/postludes/SkyElevator';
import {UnderwaterResort} from '../../../src/server/cards/postludes/UnderwaterResort';

describe('Postlude cards', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {postludesExpansion: true, individualTracks: true});
  });

  /** A land space whose six neighbours are all plain land, so there is room to build around it. */
  function centre(): Space {
    const board = game.board;
    const space = board.spaces.find((s) =>
      s.spaceType === SpaceType.LAND && s.tile === undefined &&
      board.getAdjacentSpaces(s).length === 6 &&
      board.getAdjacentSpaces(s).every((a) => a.spaceType === SpaceType.LAND && a.tile === undefined));
    if (space === undefined) {
      throw new Error('no free area');
    }
    return space;
  }

  function put(space: Space, tileType: TileType, owner: TestPlayer = player): void {
    game.simpleAddTile(owner, space, {tileType});
  }

  /** Puts `card` on `space`, as if played. */
  function install<T extends PostludeCard>(card: T, space: Space, owner: TestPlayer = player): T {
    owner.playedCards.push(card);
    Postludes.place(owner, card, space);
    return card;
  }

  /** A city of the player's with the postlude on it and the given tiles around it. */
  function cityWith<T extends PostludeCard>(card: T, around: Array<TileType> = []): T {
    const space = centre();
    put(space, TileType.CITY);
    install(card, space);
    game.board.getAdjacentSpaces(space).forEach((s, i) => {
      if (around[i] !== undefined) {
        put(s, around[i]);
      }
    });
    return card;
  }

  function greeneryWith<T extends PostludeCard>(card: T, around: Array<TileType> = []): T {
    const space = centre();
    put(space, TileType.GREENERY);
    install(card, space);
    game.board.getAdjacentSpaces(space).forEach((s, i) => {
      if (around[i] !== undefined) {
        put(s, around[i]);
      }
    });
    return card;
  }

  const C = TileType.CITY;
  const G = TileType.GREENERY;
  const O = TileType.OCEAN;

  describe('the set', () => {
    const cards = CardManifest.entries(POSTLUDES_CARD_MANIFEST.projectCards).map(([, entry]) => new entry!.Factory());

    it('has all 42 cards, numbered L01 to L42', () => {
      expect(cards).has.length(42);
      expect(cards.map((c) => c.name)).to.have.members([...POSTLUDE_CARD_NAMES]);
      const numbers = cards.map((c) => c.metadata.cardNumber);
      expect(new Set(numbers).size).eq(42);
      for (let i = 1; i <= 42; i++) {
        expect(numbers).includes('L' + String(i).padStart(2, '0'));
      }
    });

    it('every card knows what it goes on', () => {
      for (const card of cards) {
        expect(card).instanceOf(PostludeCard);
        expect(['city', 'greenery', 'ocean']).includes((card as PostludeCard).postludeKind);
      }
    });

    it('has 18 city, 9 greenery and 15 ocean postludes', () => {
      const kinds = cards.map((c) => (c as PostludeCard).postludeKind);
      expect(kinds.filter((k) => k === 'city')).has.length(18);
      expect(kinds.filter((k) => k === 'greenery')).has.length(9);
      expect(kinds.filter((k) => k === 'ocean')).has.length(15);
    });
  });

  describe('city postludes', () => {
    it('Astro-University needs three science tags', () => {
      addCity(player);
      player.megaCredits = 100;
      const card = new AstroUniversity();
      expect(card.canPlay(player)).is.false;
      player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
      expect(card.canPlay(player)).is.true;
    });

    it('Astro-University gives cities within two tiles 1 VP per adjacent greenery', () => {
      const space = centre();
      put(space, C);
      install(new AstroUniversity(), space);
      const ring = game.board.getAdjacentSpaces(space);
      put(ring[0], G);
      put(ring[1], G);
      const before = calculateVictoryPoints(player).total;
      // The host city sees two greeneries. Another city of the player's 2 tiles away sees one too.
      const outer = game.board.getAdjacentSpaces(ring[3]).find((s) =>
        s.tile === undefined && s.spaceType === SpaceType.LAND && !ring.includes(s) && s !== space)!;
      put(outer, C);
      const neighbour = game.board.getAdjacentSpaces(outer).find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND)!;
      put(neighbour, G);
      const after = calculateVictoryPoints(player);
      expect(after.total).is.greaterThan(before);
      expect(after.victoryPoints).is.greaterThan(0);
    });

    it('Deluxe Waterfront Resort needs an ocean next to the city, and pays 3 M€ for each', () => {
      const space = centre();
      put(space, C);
      const ring = game.board.getAdjacentSpaces(space);
      player.megaCredits = 100;
      const card = new DeluxeWaterfrontResort();
      expect(card.canPlay(player)).is.false;
      put(ring[0], O);
      put(ring[1], O);
      expect(card.canPlay(player)).is.true;
      install(card, space);
      expect(card.canAct(player)).is.true;
      player.megaCredits = 0;
      card.action(player);
      expect(player.megaCredits).eq(6);
    });

    it('Mining Depot gives 1 steel for each empty space around it', () => {
      const card = cityWith(new MiningDepot(), [G, G]);
      player.steel = 0;
      card.action(player);
      expect(player.steel).eq(4);
    });

    it('Mineral Refinery gives 1 titanium for each empty space around it', () => {
      const card = cityWith(new MineralRefinery(), [G]);
      card.action(player);
      expect(player.titanium).eq(5);
    });

    it('Pharmaceutical Company pays 2 M€ for each adjacent tile', () => {
      const card = cityWith(new PharmaceuticalCompany(), [G, C, O]);
      player.megaCredits = 0;
      card.action(player);
      expect(player.megaCredits).eq(6);
    });

    it('Nano-Particle Facility gives a standard resource for every 2 adjacent tiles', () => {
      const card = cityWith(new NanoParticleFacility(), [G, G, G, G, G]);
      expect(card.canAct(player)).is.true;
      const input = cast(card.action(player), SelectResources);
      input.cb(Units.of({plants: 2}));
      expect(player.plants).eq(2);
    });

    it('Nano-Particle Facility has no action with fewer than 2 adjacent tiles', () => {
      const card = cityWith(new NanoParticleFacility(), [G]);
      expect(card.canAct(player)).is.false;
    });

    it('Power Converter turns energy into heat and heat into energy, once for each adjacent tile', () => {
      const card = cityWith(new PowerConverter(), [G, G, G]);
      player.energy = 5;
      player.heat = 1;
      const toHeat = cast(card.action(player), SelectAmount);
      expect(toHeat.max).eq(3);
      const toEnergy = cast(toHeat.cb(2), SelectAmount);
      expect(player.energy).eq(3);
      expect(player.heat).eq(3);
      // 3 conversions in all: 2 used, so 1 left to go the other way.
      expect(toEnergy.max).eq(1);
      toEnergy.cb(1);
      expect(player.energy).eq(4);
      expect(player.heat).eq(2);
    });

    it('Science Institute needs two adjacent tiles and draws for each empty space around it', () => {
      const space = centre();
      put(space, C);
      player.megaCredits = 100;
      const card = new ScienceInstitute();
      expect(card.canPlay(player)).is.false;
      const ring = game.board.getAdjacentSpaces(space);
      put(ring[0], G);
      put(ring[1], G);
      expect(card.canPlay(player)).is.true;
      install(card, space);
      card.action(player);
      runAllActions(game);
      expect(player.cardsInHand).has.length(4);
    });

    it('Re-Development Office needs a Special tile next to the city', () => {
      const space = centre();
      put(space, C);
      player.megaCredits = 100;
      const card = new ReDevelopmentOffice();
      expect(card.canPlay(player)).is.false;
      put(game.board.getAdjacentSpaces(space)[0], TileType.MOHOLE_AREA);
      expect(card.canPlay(player)).is.true;
    });

    it('Re-Development Office draws from the discard pile', () => {
      const space = centre();
      put(space, C);
      const ring = game.board.getAdjacentSpaces(space);
      put(ring[0], TileType.MOHOLE_AREA);
      const card = install(new ReDevelopmentOffice(), space);
      const discarded = game.projectDeck.drawN(game, 5);
      game.projectDeck.discard(...discarded);
      expect(card.canAct(player)).is.true;
      card.action(player);
      expect(player.cardsInHand.length).is.greaterThan(0);
      expect(player.cardsInHand.length).is.at.most(5);
    });

    it('Mars Casino keeps one drawn card that costs more than the revealed one', () => {
      const card = cityWith(new MarsCasino(), [G, G]);
      expect(card.canAct(player)).is.true;
      const result = card.action(player);
      if (result === undefined) {
        // Nothing drawn was dear enough.
        expect(player.cardsInHand).is.empty;
      } else {
        const input = cast(result, SelectCard);
        const reference = game.projectDeck.discardPile[game.projectDeck.discardPile.length - 1];
        for (const option of input.cards) {
          expect(option.cost).is.greaterThan(reference.cost);
        }
        input.cb([input.cards[0]]);
        expect(player.cardsInHand).has.length(1);
      }
    });

    it('Mars Hospital gives TR for an adjacent greenery after oxygen is maxed', () => {
      const space = centre();
      put(space, C);
      install(new MarsHospital(), space);
      setOxygenLevel(game, 14);
      const tr = player.terraformRating;
      const target = game.board.getAdjacentSpaces(space)[0];
      game.addGreenery(player, target);
      runAllActions(game);
      expect(player.terraformRating).eq(tr + 1);
    });

    it('Mars Hospital does nothing while oxygen can still rise, or away from the hospital', () => {
      const space = centre();
      put(space, C);
      install(new MarsHospital(), space);
      const ring = game.board.getAdjacentSpaces(space);
      const tr = player.terraformRating;
      game.addGreenery(player, ring[0]);
      runAllActions(game);
      // The normal oxygen TR, and nothing extra.
      expect(player.terraformRating).eq(tr + 1);
      setOxygenLevel(game, 14);
      const far = game.board.spaces.find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND && !ring.includes(s) && s !== space)!;
      const tr2 = player.terraformRating;
      game.addGreenery(player, far);
      runAllActions(game);
      expect(player.terraformRating).eq(tr2);
    });

    it('Black Market swaps 3 standard resources for any 3', () => {
      const space = centre();
      put(space, C);
      const card = install(new BlackMarket(), space);
      expect(card.canAct(player)).is.false;
      player.megaCredits = 4;
      player.plants = 2;
      expect(card.canAct(player)).is.true;
      const spend = cast(card.action(player), SelectResources);
      const gain = cast(spend.cb(Units.of({megacredits: 3})), SelectResources);
      gain.cb(Units.of({titanium: 3}));
      expect(player.megaCredits).eq(1);
      expect(player.titanium).eq(3);
    });

    it('Food Processing Unit makes food from a plant and an animal, and sells it', () => {
      const card = cityWith(new FoodProcessingUnit(), [G, G]);
      const animals = fakeCard({name: 'Animals' as CardName, resourceType: CardResource.ANIMAL});
      player.playedCards.push(animals);
      animals.resourceCount = 1;
      player.plants = 1;
      expect(card.canAct(player)).is.true;
      const add = cast(card.action(player), SelectCard);
      add.cb([animals]);
      expect(card.resourceCount).eq(1);
      expect(player.plants).eq(0);
      expect(animals.resourceCount).eq(0);

      player.megaCredits = 0;
      const tr = player.terraformRating;
      card.action(player);
      expect(card.resourceCount).eq(0);
      expect(player.megaCredits).eq(8);
      expect(player.terraformRating).eq(tr + 1);
    });
  });

  describe('bespoke city postludes', () => {
    it('Flight Academy moves a resource between two cards that hold the same type', () => {
      const card = cityWith(new FlightAcademy());
      const a = fakeCard({name: 'A' as CardName, resourceType: CardResource.ANIMAL});
      const b = fakeCard({name: 'B' as CardName, resourceType: CardResource.ANIMAL});
      player.playedCards.push(a, b);
      a.resourceCount = 2;
      expect(card.canAct(player)).is.true;
      const from = cast(card.action(player), SelectCard);
      expect(from.cards).deep.eq([a]);
      const to = cast(from.cb([a]), SelectCard);
      expect(to.cards).deep.eq([b]);
      to.cb([b]);
      expect(a.resourceCount).eq(1);
      expect(b.resourceCount).eq(1);
    });

    it('Flight Academy has no action without a second card for the resource', () => {
      const card = cityWith(new FlightAcademy());
      const a = fakeCard({name: 'A' as CardName, resourceType: CardResource.ANIMAL});
      player.playedCards.push(a);
      a.resourceCount = 2;
      expect(card.canAct(player)).is.false;
    });

    it('City Project Library replays an event for 1 M€ less per adjacent tile of yours, then discards it', () => {
      const card = cityWith(new CityProjectLibrary(), [G, G, G]);
      const event = new Asteroid();
      player.playedCards.push(event);
      player.megaCredits = event.cost - 3;
      expect(card.canAct(player)).is.true;
      const select = cast(card.action(player), SelectCard);
      expect(select.cards).deep.eq([event]);
      const titanium = player.titanium;
      select.cb([event]);
      runAllActions(game);
      expect(player.megaCredits).eq(0);
      expect(player.titanium).eq(titanium + 2);
      expect(player.playedCards.asArray()).does.not.include(event);
      expect(game.projectDeck.discardPile).includes(event);
    });

    it('City Project Library does not count tiles of other players', () => {
      const card = cityWith(new CityProjectLibrary(), []);
      put(game.board.getAdjacentSpaces(Postludes.spaceOf(game, card.name)!)[0], G, player2);
      const event = new Asteroid();
      player.playedCards.push(event);
      player.megaCredits = event.cost - 1;
      expect(card.canAct(player)).is.false;
    });
  });

  describe('greenery postludes', () => {
    it('Amusement Park scores 1 VP per adjacent city', () => {
      const card = greeneryWith(new AmusementPark(), [C, C, G]);
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('Amusement Park doubles the placement bonus next to it, for its owner only', () => {
      const space = centre();
      put(space, G);
      install(new AmusementPark(), space);
      const next = game.board.getAdjacentSpaces(space)[0];
      expect(Postludes.doublesPlacementBonus(player, next)).is.true;
      expect(Postludes.doublesPlacementBonus(player2, next)).is.false;
      const far = game.board.spaces.find((s) => !game.board.getAdjacentSpaces(space).includes(s) && s !== space)!;
      expect(Postludes.doublesPlacementBonus(player, far)).is.false;
    });

    it('Animal Farm needs 2 adjacent cities', () => {
      const space = centre();
      put(space, G);
      player.megaCredits = 100;
      const card = new AnimalFarm();
      expect(card.canPlay(player)).is.false;
      const ring = game.board.getAdjacentSpaces(space);
      put(ring[0], C);
      put(ring[1], C);
      expect(card.canPlay(player)).is.true;
    });

    it('Animal Farm adds an animal per adjacent greenery and scores 1 VP per 2 animals', () => {
      const card = greeneryWith(new AnimalFarm(), [C, C, G, G, G]);
      card.action(player);
      expect(card.resourceCount).eq(3);
      expect(card.getVictoryPoints(player)).eq(1);
    });

    it('Cultivation Biodome gives a plant per adjacent ocean and 1 VP for each', () => {
      const card = greeneryWith(new CultivationBiodome(), [O, O, O]);
      card.action(player);
      expect(player.plants).eq(3);
      expect(card.getVictoryPoints(player)).eq(3);
    });

    it('Photobionic Power Station gives energy per adjacent greenery and 1 VP for each', () => {
      const card = greeneryWith(new PhotobionicPowerStation(), [G, G]);
      card.action(player);
      expect(player.energy).eq(2);
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('Probiotics Facility turns microbes into probiotics, which pay M€ for the generation', () => {
      const card = greeneryWith(new ProbioticsFacility());
      const microbes = fakeCard({name: 'Microbes' as CardName, resourceType: CardResource.MICROBE});
      player.playedCards.push(microbes);
      microbes.resourceCount = 2;
      const add = cast(card.action(player), SelectCard);
      add.cb([microbes]);
      expect(card.resourceCount).eq(1);
      expect(microbes.resourceCount).eq(1);
      game.generation = 5;
      player.megaCredits = 0;
      // Two options now. Pick the spend option.
      const options = cast(card.action(player), OrOptions);
      options.options[1].cb();
      expect(player.megaCredits).eq(5);
      expect(card.resourceCount).eq(0);
    });

    it('Probiotics Facility scores 1 VP per 2 probiotics', () => {
      const card = greeneryWith(new ProbioticsFacility());
      card.resourceCount = 5;
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('Universal Bio-Store pays 1 M€ per microbe, plant and animal tag, and scores per adjacent tile', () => {
      const card = greeneryWith(new UniversalBioStore(), [C, G, O]);
      player.playedCards.push(fakeCard({tags: [Tag.PLANT, Tag.MICROBE, Tag.ANIMAL, Tag.ANIMAL, Tag.SPACE]}));
      player.megaCredits = 0;
      const own = card.tags.length;
      card.action(player);
      expect(player.megaCredits).eq(4 + own - 0);
      expect(card.getVictoryPoints(player)).eq(3);
    });

    it('Soil Enrichment Lab makes a greenery next to it cost 1 plant less', () => {
      const space = centre();
      put(space, G);
      install(new SoilEnrichmentLab(), space);
      const next = game.board.getAdjacentSpaces(space)[0];
      const far = game.board.spaces.find((s) => s.tile === undefined && s.spaceType === SpaceType.LAND && !game.board.getAdjacentSpaces(space).includes(s) && s !== space)!;
      expect(IdesOfMars.plantsForGreeneryOn(player, next)).eq(player.plantsNeededForGreenery - 1);
      expect(IdesOfMars.plantsForGreeneryOn(player, far)).eq(player.plantsNeededForGreenery);
    });

    it('Soil Enrichment Lab scores 1 VP per adjacent greenery of yours', () => {
      const card = greeneryWith(new SoilEnrichmentLab(), [G, G]);
      put(game.board.getAdjacentSpaces(Postludes.spaceOf(game, card.name)!)[5], G, player2);
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('Waste Processing Centre gives 3 heat per adjacent city and 1 VP for each', () => {
      const card = greeneryWith(new WasteProcessingCentre(), [C, C]);
      card.action(player);
      expect(player.heat).eq(6);
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('National Green Park gives a Plant, Microbe or Animal card when you place a greenery next to it', () => {
      const space = centre();
      put(space, G);
      install(new NationalGreenPark(), space);
      const next = game.board.getAdjacentSpaces(space)[0];
      const drawPile = game.projectDeck.drawPile.length;
      game.addGreenery(player, next);
      runAllActions(game);
      expect(player.cardsInHand.length).is.at.most(1);
      if (player.cardsInHand.length === 1) {
        const card = player.cardsInHand[0] as IProjectCard;
        expect(card.tags.some((t) => t === Tag.PLANT || t === Tag.MICROBE || t === Tag.ANIMAL)).is.true;
      }
      // What was skipped goes back into the deck.
      expect(game.projectDeck.drawPile.length + player.cardsInHand.length).eq(drawPile);
    });

    it('National Green Park ignores greeneries away from it, and other players\' greeneries', () => {
      const space = centre();
      put(space, G);
      install(new NationalGreenPark(), space);
      const next = game.board.getAdjacentSpaces(space)[0];
      game.addGreenery(player2, next);
      runAllActions(game);
      expect(player.cardsInHand).is.empty;
    });
  });

  describe('ocean postludes', () => {
    function placeOcean<T extends PostludeCard>(card: T): Space {
      player.individualTracksData!.positions.oceans = 1;
      player.megaCredits = 100;
      const space = addOcean(player2);
      expect(card.canPlay(player)).is.true;
      const select = cast(card.play(player), SelectSpace);
      select.cb(space);
      player.playedCards.push(card);
      return space;
    }

    it('cannot be played without the ocean track', () => {
      addOcean(player2);
      player.megaCredits = 100;
      expect(new DeepSeaMiningRig().canPlay(player)).is.false;
    });

    it('Deep Sea Mining Rig: +1 steel production and 1 VP per 4 steel production', () => {
      const card = new DeepSeaMiningRig();
      const space = placeOcean(card);
      expect(player.production.steel).eq(1);
      expect(space.tile?.postlude).eq(CardName.DEEP_SEA_MINING_RIG);
      player.production.override({steel: 9});
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('Underwater Resort: +2 M€ production and 1 VP per adjacent greenery', () => {
      const card = new UnderwaterResort();
      const space = placeOcean(card);
      expect(player.production.megacredits).eq(2);
      game.board.getAdjacentSpaces(space).filter((s) => s.tile === undefined && s.spaceType === SpaceType.LAND).slice(0, 2)
        .forEach((s) => put(s, G));
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('Sport Diving School: +2 M€ production and 1 VP per adjacent city', () => {
      const card = new SportDivingSchool();
      const space = placeOcean(card);
      expect(player.production.megacredits).eq(2);
      game.board.getAdjacentSpaces(space).filter((s) => s.tile === undefined && s.spaceType === SpaceType.LAND).slice(0, 1)
        .forEach((s) => put(s, C));
      expect(card.getVictoryPoints(player)).eq(1);
    });

    it('Marine Aquarium: animals for every animal tag, including its own, and 1 VP per 3 animal tags', () => {
      const card = new MarineAquarium();
      player.playedCards.push(fakeCard({tags: [Tag.ANIMAL, Tag.ANIMAL]}));
      const animals = fakeCard({name: 'Animals' as CardName, resourceType: CardResource.ANIMAL});
      player.playedCards.push(animals);
      placeOcean(card);
      runAllActions(game);
      expect(animals.resourceCount).eq(3);
      expect(card.getVictoryPoints(player)).eq(1);
    });

    it('Aquatic Life Laboratory: 2 science resources', () => {
      const card = new AquaticLifeLaboratory();
      const science = fakeCard({name: 'Science' as CardName, resourceType: CardResource.SCIENCE});
      player.playedCards.push(science);
      placeOcean(card);
      runAllActions(game);
      expect(science.resourceCount).eq(2);
    });

    it('Sky Elevator: 2 standard resources, and 1 VP per production above 5', () => {
      const card = new SkyElevator();
      placeOcean(card);
      runAllActions(game);
      const input = cast(player.popWaitingFor(), SelectResources);
      input.cb(Units.of({steel: 2}));
      expect(player.steel).eq(2);
      player.production.override({megacredits: 6, steel: 5, heat: 9});
      expect(card.getVictoryPoints(player)).eq(2);
    });

    it('gives its adjacency bonus to whoever places a tile next to it', () => {
      const card = new DeepSeaMiningRig();
      const oceanSpace = placeOcean(card);
      const next = game.board.getAdjacentSpaces(oceanSpace).find((s) => game.board.getAvailableSpacesForCity(player2).includes(s))!;
      player2.steel = 0;
      game.addCity(player2, next);
      runAllActions(game);
      expect(player2.steel).eq(1);
    });

    it('Research Watchtower draws 2 cards and scores 1 VP per 10 cards played', () => {
      const card = new (require('../../../src/server/cards/postludes/ResearchWatchtower').ResearchWatchtower)();
      placeOcean(card);
      runAllActions(game);
      expect(player.cardsInHand).has.length(2);
      expect(card.getVictoryPoints(player)).eq(0);
    });
  });

  describe('Machinery Factory and Metallurgy Workshop', () => {
    function next(space: Space, project: 'city' | 'greenery'): Space {
      const options = project === 'city' ? game.board.getAvailableSpacesForCity(player) : game.board.getAvailableSpacesForGreenery(player);
      return game.board.getAdjacentSpaces(space).find((s) => options.includes(s))!;
    }

    it('lets the Greenery standard project take steel next to the Factory', () => {
      const space = centre();
      put(space, C);
      install(new MachineryFactory(), space);
      const project = new GreeneryStandardProject();
      expect(Postludes.standardProjectPayWith(player, project, {}).steel).is.true;
      expect(Postludes.standardProjectPayWith(player, project, {}).titanium).is.undefined;
    });

    it('does not apply to other players', () => {
      const space = centre();
      put(space, C);
      install(new MachineryFactory(), space);
      expect(Postludes.standardProjectPayWith(player2, new GreeneryStandardProject(), {}).steel).is.undefined;
    });

    it('cannot help the City standard project, since a city cannot go next to the city the postlude is on', () => {
      const space = centre();
      put(space, C);
      install(new MachineryFactory(), space);
      expect(Postludes.standardProjectPayWith(player, new CityStandardProject(), {}).steel).is.undefined;
    });

    it('pays with steel only when the greenery goes next to the Factory', () => {
      const space = centre();
      put(space, C);
      install(new MachineryFactory(), space);
      const project = new GreeneryStandardProject();
      player.megaCredits = 0;
      player.steel = 12;
      expect(project.canAct(player)).is.true;
      project.payAndExecute(player, {...Payment.EMPTY, steel: 12});
      runAllActions(game);
      const select = cast(player.popWaitingFor(), SelectSpace);
      const adjacent = game.board.getAdjacentSpaces(space);
      expect(select.spaces.length).is.greaterThan(0);
      for (const s of select.spaces) {
        expect(adjacent).includes(s);
      }
    });

    it('pays with M€ anywhere', () => {
      const space = centre();
      put(space, C);
      install(new MachineryFactory(), space);
      const project = new GreeneryStandardProject();
      player.megaCredits = 23;
      project.payAndExecute(player, {...Payment.EMPTY, megacredits: 23});
      runAllActions(game);
      const select = cast(player.popWaitingFor(), SelectSpace);
      expect(select.spaces).deep.eq(game.board.getAvailableSpacesForGreenery(player));
    });

    it('cannot pay with steel when there is no room next to it', () => {
      const space = centre();
      put(space, C);
      install(new MachineryFactory(), space);
      game.board.getAdjacentSpaces(space).forEach((s) => put(s, G, player2));
      expect(Postludes.standardProjectPayWith(player, new GreeneryStandardProject(), {}).steel).is.undefined;
    });

    it('lets the Greenery standard project take titanium next to the Workshop', () => {
      const space = centre();
      put(space, C);
      install(new MetallurgyWorkshop(), space);
      const project = new GreeneryStandardProject();
      expect(Postludes.standardProjectPayWith(player, project, {}).titanium).is.true;
      player.megaCredits = 0;
      player.titanium = 5;
      project.payAndExecute(player, {...Payment.EMPTY, titanium: 5});
      runAllActions(game);
      const select = cast(player.popWaitingFor(), SelectSpace);
      const target = next(space, 'greenery');
      expect(select.spaces).includes(target);
      for (const s of select.spaces) {
        expect(game.board.getAdjacentSpaces(space)).includes(s);
      }
    });
  });

  describe('every card', () => {
    it('can be built and rendered', () => {
      for (const [name, entry] of CardManifest.entries(POSTLUDES_CARD_MANIFEST.projectCards)) {
        const card = new entry!.Factory();
        expect(card.name, name).eq(name);
        expect(card.metadata.renderData, name).is.not.undefined;
        expect(card.metadata.description, name).is.not.undefined;
      }
    });

    it('is only playable when the player has a tile to build on', () => {
      player.megaCredits = 1000;
      player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.VENUS, Tag.EARTH]}));
      for (const [name, entry] of CardManifest.entries(POSTLUDES_CARD_MANIFEST.projectCards)) {
        const card = new entry!.Factory();
        expect(card.canPlay(player), name).is.false;
      }
    });

    it('Board helpers agree with the board about adjacency', () => {
      const space = centre();
      expect(Postludes.neighbors(game, space)).deep.eq(game.board.getAdjacentSpaces(space));
      expect(Board.hasRealTile(space)).is.false;
    });
  });
});
