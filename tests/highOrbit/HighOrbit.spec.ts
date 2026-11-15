import {expect} from 'chai';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {IGame} from '../../src/server/IGame';
import {Game} from '../../src/server/Game';
import {runAllActions, forceGenerationEnd, addOcean, setTemperature, setOxygenLevel} from '../TestingUtils';
import {cast} from '../../src/common/utils/utils';
import {CardName} from '../../src/common/cards/CardName';
import {CardType} from '../../src/common/cards/CardType';
import {Tag} from '../../src/common/cards/Tag';
import {Resource} from '../../src/common/Resource';
import {CardResource} from '../../src/common/CardResource';
import {
  INFRASTRUCTURE_CATEGORIES,
  INFRASTRUCTURE_DESIGNS,
  infrastructureDesign,
  isInfrastructureCopy,
} from '../../src/common/highOrbit/HighOrbit';
import {HighOrbit} from '../../src/server/highOrbit/HighOrbit';
import {SelectInfrastructure} from '../../src/server/inputs/SelectInfrastructure';
import {SelectStandardProjectToPlay} from '../../src/server/inputs/SelectStandardProjectToPlay';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {SelectCard} from '../../src/server/inputs/SelectCard';
import {SelectColony} from '../../src/server/inputs/SelectColony';
import {SelectSpace} from '../../src/server/inputs/SelectSpace';
import {newProjectCard, newCard} from '../../src/server/createCard';
import {IProjectCard} from '../../src/server/cards/IProjectCard';
import {isIActionCard, ICard} from '../../src/server/cards/ICard';
import {Viron} from '../../src/server/cards/venusNext/Viron';
import {Payment} from '../../src/common/inputs/Payment';
import {Phase} from '../../src/common/Phase';
import {LagrangeCollective} from '../../src/server/cards/highorbit/LagrangeCollective';
import {PlanetaryEngineeringCorps} from '../../src/server/cards/highorbit/PlanetaryEngineeringCorps';
import {TrojanSpaceLogistics} from '../../src/server/cards/highorbit/TrojanSpaceLogistics';
import {Spacetek} from '../../src/server/cards/highorbit/Spacetek';
import {JudgesOfChange} from '../../src/server/cards/highorbit/JudgesOfChange';
import {Tardigrades} from '../../src/server/cards/base/Tardigrades';
import {AsteroidMine} from '../../src/server/cards/highorbit/AsteroidMine';
import {AutoFactory} from '../../src/server/cards/highorbit/AutoFactory';
import {ICorporationCard} from '../../src/server/cards/corporation/ICorporationCard';
import {GameCards} from '../../src/server/GameCards';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';
import {KuipersExpansion} from '../../src/server/turmoil/giga/events/KuipersExpansion';
import {ConstructionOfTheDysonSwarm} from '../../src/server/turmoil/giga/events/ConstructionOfTheDysonSwarm';
import {OreRefinery} from '../../src/server/cards/postludes/OreRefinery';
import {Turmoil} from '../../src/server/turmoil/Turmoil';

function card(name: CardName): IProjectCard {
  const c = newProjectCard(name);
  if (c === undefined) {
    throw new Error(name);
  }
  return c;
}

/** Put a stack into a section for the test, replacing the first one. */
function forceStack(game: IGame, name: CardName) {
  const design = infrastructureDesign(name)!;
  game.highOrbit!.sectors[design.category][0] = design.name;
}

/** Plays an infrastructure copy straight into the tableau, as buying it would. */
function give(player: TestPlayer, name: CardName): IProjectCard {
  const c = card(name);
  player.playCard(c);
  runAllActions(player.game);
  return c;
}

describe('HighOrbit', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {highOrbitExpansion: true, coloniesExtension: true});
  });

  it('is off by default', () => {
    const [offGame, offPlayer] = testGame(2);
    expect(offGame.highOrbit).is.undefined;
    expect(offPlayer.getActions().options.some((o) => o instanceof SelectInfrastructure)).is.false;
  });

  it('deals two stacks per section', () => {
    for (const category of INFRASTRUCTURE_CATEGORIES) {
      const stacks = game.highOrbit!.sectors[category];
      expect(stacks).has.length(2);
      for (const name of stacks) {
        expect(infrastructureDesign(name)?.category).eq(category);
      }
    }
    expect(game.tags).includes(Tag.INFRASTRUCTURE);
  });

  it('leaves out Comsat and Freighter without Colonies', () => {
    for (let i = 0; i < 30; i++) {
      const [g] = testGame(2, {highOrbitExpansion: true}, `-${i}`);
      const all = Object.values(g.highOrbit!.sectors).flat();
      expect(all).not.includes(CardName.COMSAT);
      expect(all).not.includes(CardName.FREIGHTER);
    }
  });

  it('has 18 stacks with 6 numbered copies each, all silver cards with the infrastructure tag', () => {
    expect(INFRASTRUCTURE_DESIGNS).has.length(18);
    for (const design of INFRASTRUCTURE_DESIGNS) {
      expect(design.copies).has.length(6);
      design.copies.forEach((name, idx) => {
        const c = card(name);
        expect(c.type).eq(CardType.INFRASTRUCTURE);
        expect(c.tags).includes(Tag.INFRASTRUCTURE);
        expect(c.cost).eq(design.cost);
        expect(isInfrastructureCopy(name)).eq(idx > 0);
      });
    }
  });

  it('keeps silver cards out of the project deck', () => {
    const cards = new GameCards({...DEFAULT_GAME_OPTIONS, highOrbitExpansion: true}).getProjectCards();
    expect(cards.some((c) => c.type === CardType.INFRASTRUCTURE)).is.false;
    expect(game.projectDeck.drawPile.some((c) => c.type === CardType.INFRASTRUCTURE)).is.false;
  });

  it('puts the Infrastructures menu right above the standard projects', () => {
    const options = player.getActions().options;
    const infra = options.findIndex((o) => o instanceof SelectInfrastructure);
    const sp = options.findIndex((o) => o instanceof SelectStandardProjectToPlay);
    expect(infra).gte(0);
    expect(infra).eq(sp - 1);
  });

  describe('buying', () => {
    let stack: CardName;

    beforeEach(() => {
      stack = CardName.HYDROPONICS;
      forceStack(game, stack);
      player.titanium = 10;
      player.tagsForTest = {space: 2};
    });

    it('needs more space tags than infrastructure tags', () => {
      player.tagsForTest = {space: 1, infrastructure: 1};
      expect(HighOrbit.disabledReason(player, infrastructureDesign(stack)!)).eq('You need more space tags than infrastructure tags');
      player.tagsForTest = {space: 2, infrastructure: 1};
      expect(HighOrbit.disabledReason(player, infrastructureDesign(stack)!)).is.undefined;
    });

    it('costs titanium only', () => {
      player.titanium = 3;
      player.megaCredits = 100;
      expect(HighOrbit.disabledReason(player, infrastructureDesign(stack)!)).eq('Not enough titanium');
    });

    it('pays titanium, puts a cube on the section, plays the card and ends the turn', () => {
      player.actionsTakenThisRound = 0;
      const bought = HighOrbit.buy(player, infrastructureDesign(stack)!);
      runAllActions(game);
      expect(bought.name).eq(CardName.HYDROPONICS);
      expect(player.titanium).eq(6);
      expect(player.tableau.has(CardName.HYDROPONICS)).is.true;
      expect(game.highOrbit!.used.advanced).eq(player.id);
      expect(player.actionsTakenThisRound).eq(player.availableActionsThisRound);
    });

    it('works through the action menu input', () => {
      const input = cast(player.getActions().options.find((o) => o instanceof SelectInfrastructure), SelectInfrastructure);
      const model = input.toModel(player);
      const advanced = model.sectors.find((s) => s.category === 'advanced')!;
      expect(advanced.stacks[0].card).eq(CardName.HYDROPONICS);
      expect(advanced.stacks[0].remaining).eq(2);
      expect(advanced.stacks[0].disabledReason).is.undefined;
      input.process({type: 'infrastructure', card: CardName.HYDROPONICS});
      runAllActions(game);
      expect(player.tableau.has(CardName.HYDROPONICS)).is.true;
      const after = cast(input, SelectInfrastructure).toModel(player).sectors.find((s) => s.category === 'advanced')!;
      expect(after.usedBy).eq(player.color);
      expect(after.stacks[0].card).eq(CardName.HYDROPONICS_2);
      expect(after.stacks[0].remaining).eq(1);
    });

    it('lets each section be used by one player per generation', () => {
      HighOrbit.buy(player, infrastructureDesign(stack)!);
      player2.titanium = 10;
      player2.tagsForTest = {space: 3};
      expect(HighOrbit.disabledReason(player2, infrastructureDesign(stack)!)).eq('This section was already used this generation');
      // The other two sections are still open.
      const sat = infrastructureDesign(game.highOrbit!.sectors.satellites[0])!;
      expect(HighOrbit.disabledReason(player2, sat)).not.eq('This section was already used this generation');
    });

    it('removes the cubes at the end of the generation', () => {
      HighOrbit.buy(player, infrastructureDesign(stack)!);
      forceGenerationEnd(game);
      expect(game.highOrbit!.used).deep.eq({});
    });

    it('has one copy per player, numbered', () => {
      HighOrbit.buy(player, infrastructureDesign(stack)!);
      game.highOrbit!.used = {};
      player2.titanium = 10;
      player2.tagsForTest = {space: 2};
      const second = HighOrbit.buy(player2, infrastructureDesign(stack)!);
      expect(second.name).eq(CardName.HYDROPONICS_2);
      game.highOrbit!.used = {};
      player.tagsForTest = {space: 5, infrastructure: 1};
      expect(HighOrbit.disabledReason(player, infrastructureDesign(stack)!)).eq('No copies left');
    });

    it('rejects a stack that is not in the game', () => {
      const input = new SelectInfrastructure(player);
      const missing = INFRASTRUCTURE_DESIGNS.find((d) => HighOrbit.categoryOf(game, d.name) === undefined)!;
      expect(() => input.process({type: 'infrastructure', card: missing.name})).to.throw();
    });

    it('survives saving and loading', () => {
      HighOrbit.buy(player, infrastructureDesign(stack)!);
      const restored = Game.deserialize(JSON.parse(JSON.stringify(game.serialize())));
      expect(restored.highOrbit).deep.eq(game.highOrbit);
      expect(restored.getPlayerById(player.id).tableau.has(CardName.HYDROPONICS)).is.true;
    });
  });

  describe('silver cards are not blue cards', () => {
    it('their tags count', () => {
      give(player, CardName.ORBITAL_SHIPYARD);
      expect(player.tags.count(Tag.SPACE, 'raw')).eq(1);
      expect(player.tags.count(Tag.INFRASTRUCTURE, 'raw')).eq(1);
    });

    it('their actions are in the action menu', () => {
      const hydro = give(player, CardName.HYDROPONICS);
      player.energy = 1;
      expect(player.getPlayableActionCards()).includes(hydro);
    });

    it('Viron cannot reuse them', () => {
      const viron = new Viron();
      player.playedCards.push(viron);
      const hydro = give(player, CardName.HYDROPONICS);
      player.energy = 2;
      player.actionsThisGeneration.add(hydro.name);
      expect(viron.canAct(player)).is.false;
      const tardigrades = new Tardigrades();
      player.playedCards.push(tardigrades);
      player.actionsThisGeneration.add(tardigrades.name);
      expect(viron.canAct(player)).is.true;
    });
  });

  describe('cards', () => {
    it('every card can be played and acted on without errors', () => {
      for (const design of INFRASTRUCTURE_DESIGNS) {
        const [g, p] = testGame(2, {highOrbitExpansion: true, coloniesExtension: true});
        p.titanium = 20;
        p.energy = 10;
        p.megaCredits = 50;
        for (let i = 0; i < 4; i++) {
          p.cardsInHand.push(g.projectDeck.draw(g)!);
        }
        g.projectDeck.discard(g.projectDeck.draw(g)!);
        const c = card(design.name);
        p.playCard(c);
        runAllActions(g);
        if (isIActionCard(c) && c.canAct(p)) {
          const input = c.action(p);
          if (input instanceof OrOptions) {
            input.options[0].cb(undefined);
          }
          runAllActions(g);
        }
        expect(p.tableau.has(c.name)).is.true;
      }
    });

    it('Comsat: 1 M€ per trade', () => {
      give(player, CardName.COMSAT);
      give(player, CardName.COMSAT_2);
      player.megaCredits = 0;
      game.colonies[0].trade(player);
      runAllActions(game);
      expect(player.megaCredits).gte(2);
      const before = player.megaCredits;
      HighOrbit.onTrade(player);
      expect(player.megaCredits).eq(before + 2);
    });

    it('Weather Satellite: 1 M€ per temperature or oxygen step and per ocean', () => {
      give(player, CardName.WEATHER_SATELLITE);
      setTemperature(game, -30);
      setOxygenLevel(game, 0);
      player.megaCredits = 0;
      game.increaseTemperature(player, 2);
      expect(player.megaCredits).eq(2);
      game.increaseOxygenLevel(player, 1);
      expect(player.megaCredits).eq(3);
      addOcean(player);
      expect(player.megaCredits).gte(4);
    });

    it('Powersat: energy production and 1 energy per Powersat owned', () => {
      const powersat = give(player, CardName.POWERSAT);
      give(player, CardName.POWERSAT_2);
      player.titanium = 2;
      expect(isIActionCard(powersat) && powersat.canAct(player)).is.true;
      if (isIActionCard(powersat)) {
        powersat.action(player);
      }
      runAllActions(game);
      expect(player.production.energy).eq(1);
      expect(player.energy).eq(2);
      expect(player.titanium).eq(0);
      expect(powersat.tags).includes(Tag.POWER);
    });

    it('Probe: discards until a card without a space tag; science tags add science', () => {
      const probe = give(player, CardName.PROBE);
      player.megaCredits = 1;
      const science = card(CardName.SEARCH_FOR_LIFE); // science tag, no space tag
      game.projectDeck.drawPile.push(science);
      if (isIActionCard(probe)) {
        probe.action(player);
      }
      runAllActions(game);
      expect(game.projectDeck.discardPile).includes(science);
      expect(probe.resourceCount).eq(1);
      expect(player.megaCredits).eq(0);
    });

    it('Observatory: discard 3 cards, science per science tag plus one', () => {
      const obs = give(player, CardName.OBSERVATORY);
      const cards = [card(CardName.SEARCH_FOR_LIFE), card(CardName.PHYSICS_COMPLEX), card(CardName.BIRDS)];
      player.cardsInHand.push(...cards);
      expect(isIActionCard(obs) && obs.canAct(player)).is.true;
      const input = cast(isIActionCard(obs) ? obs.action(player) : undefined, SelectCard);
      input.cb(cards);
      // Search for Life (science) + Physics Complex (science, building) + Birds (animal) = 2, plus one.
      expect(obs.resourceCount).eq(3);
      expect(player.cardsInHand).is.empty;
      expect(obs.getVictoryPoints(player)).eq(3);
    });

    it('Navigational Beacon: 1 M€ less per space tag', () => {
      give(player, CardName.NAVIGATIONAL_BEACON);
      const asteroid = card(CardName.ASTEROID);
      expect(player.getCardCost(asteroid)).eq(asteroid.cost - 1);
    });

    it('Asteroid Mine: adds 2 ore to any card and offers to convert 2 ore into 1 energy and 1 heat', () => {
      const mine = give(player, CardName.ASTEROID_MINE);
      expect(mine).instanceOf(AsteroidMine);
      if (isIActionCard(mine)) {
        mine.action(player);
      }
      runAllActions(game);
      // Only one card holds ore, so it went there; the conversion question follows.
      expect(mine.resourceCount).eq(2);
      const convert = cast(player.popWaitingFor(), OrOptions);
      convert.options[0].cb(undefined);
      runAllActions(game);
      expect(mine.resourceCount).eq(0);
      expect(player.energy).eq(1);
      expect(player.heat).eq(1);
    });

    it('Auto Factory: 2 ore become 1 titanium or 2 steel', () => {
      const factory = give(player, CardName.AUTO_FACTORY);
      expect(factory).instanceOf(AutoFactory);
      player.addResourceTo(factory, 1);
      runAllActions(game);
      expect(player.popWaitingFor()).is.undefined;
      player.addResourceTo(factory, 1);
      runAllActions(game);
      const convert = cast(player.popWaitingFor(), OrOptions);
      expect(convert.options).has.length(3);
      convert.options[1].cb(undefined);
      runAllActions(game);
      expect(player.steel).eq(2);
      expect(factory.resourceCount).eq(0);
    });

    it('Propellant Depot: ore pays 2 M€ for Venus, Moon and Jovian cards', () => {
      const depot = give(player, CardName.PROPELLANT_DEPOT);
      const depot2 = give(player, CardName.PROPELLANT_DEPOT_2);
      depot.resourceCount = 2;
      depot2.resourceCount = 1;
      expect(player.getSpendable('propellantOre')).eq(3);
      const jovian = card(CardName.GANYMEDE_COLONY);
      expect(player['paymentOptionsForCard'](jovian).propellantOre).is.true;
      expect(player['paymentOptionsForCard'](card(CardName.BIRDS)).propellantOre).is.false;
      expect(player.payingAmount(Payment.of({propellantOre: 3}), {propellantOre: true})).eq(6);
      player.pay(Payment.of({propellantOre: 3}));
      expect(depot.resourceCount + depot2.resourceCount).eq(0);
    });

    it('Freighter: lower a marker for ore, or spend ore to raise one', () => {
      const freighter = give(player, CardName.FREIGHTER);
      const colony = game.colonies[0];
      colony.trackPosition = 3;
      expect(isIActionCard(freighter) && freighter.canAct(player)).is.true;
      const lower = isIActionCard(freighter) ? freighter.action(player) : undefined;
      // No ore yet, so lowering is the only choice.
      const select = cast(lower, SelectColony);
      select.cb(colony);
      expect(colony.trackPosition).eq(2);
      expect(freighter.resourceCount).eq(1);
      const choice = cast(isIActionCard(freighter) ? freighter.action(player) : undefined, OrOptions);
      const raise = cast(choice.options[1].cb(undefined), SelectColony);
      raise.cb(colony);
      expect(colony.trackPosition).eq(3);
      expect(freighter.resourceCount).eq(0);
    });

    it('Salvage Depot: draws from the discard pile', () => {
      const salvage = give(player, CardName.SALVAGE_DEPOT);
      const discarded = card(CardName.BIRDS);
      game.projectDeck.discardPile.push(discarded);
      player.energy = 1;
      if (isIActionCard(salvage)) {
        salvage.action(player);
      }
      expect(player.cardsInHand).has.length(1);
      expect(player.energy).eq(0);
    });

    it('Orbital Headquarters: 10 M€, 1 M€ per tag matching the corporation, max 1 per player', () => {
      const corp = cast(newCard(CardName.SPACETEK), Spacetek);
      player.playedCards.push(corp);
      player.megaCredits = 0;
      const hq = give(player, CardName.ORBITAL_HEADQUARTERS);
      // 10 M€, plus its own space tag matches Spacetek's.
      expect(player.megaCredits).eq(11);
      player.megaCredits = 0;
      player.playCard(card(CardName.ASTEROID));
      runAllActions(game);
      expect(player.megaCredits).eq(1);
      expect(card(CardName.ORBITAL_HEADQUARTERS_2).canPlay(player, {cost: 0})).is.false;
      expect(hq.tags).includes(Tag.SPACE);
    });

    it('Orbital Shipyard: 2 M€ per infrastructure tag, including its own', () => {
      player.megaCredits = 0;
      give(player, CardName.ORBITAL_SHIPYARD);
      expect(player.megaCredits).eq(2);
      give(player, CardName.HYDROPONICS);
      expect(player.megaCredits).eq(4);
    });

    it('Science Facility: energy and titanium for science; science to look at 4 cards', () => {
      const facility = give(player, CardName.SCIENCE_FACILITY);
      player.energy = 1;
      player.titanium = 1;
      const first = isIActionCard(facility) ? facility.action(player) : undefined;
      expect(first).is.undefined;
      expect(facility.resourceCount).eq(1);
      const second = isIActionCard(facility) ? facility.action(player) : undefined;
      expect(second).is.undefined;
      runAllActions(game);
      const keep = cast(player.popWaitingFor(), SelectCard);
      expect(keep.cards).has.length(4);
      expect(facility.getVictoryPoints(player)).eq(1);
    });

    it('Planetary Outpost: first player next generation, one per generation', () => {
      game.phase = Phase.ACTION;
      expect(game.first).eq(player);
      give(player2, CardName.PLANETARY_OUTPOST);
      expect(card(CardName.PLANETARY_OUTPOST_2).canPlay(player, {cost: 0})).is.false;
      forceGenerationEnd(game);
      expect(game.first).eq(player2);
    });
  });

  describe('corporations', () => {
    function corp<T extends ICorporationCard>(p: TestPlayer, c: T): T {
      p.playCorporationCard(c);
      runAllActions(p.game);
      return c;
    }

    it('Lagrange Collective: M€ production per infrastructure tag; free Orbital HQ as first action', () => {
      const lagrange = corp(player, new LagrangeCollective());
      expect(player.production.megacredits).eq(1);
      player.megaCredits = 0;
      lagrange.initialAction(player);
      runAllActions(game);
      expect(player.tableau.has(CardName.ORBITAL_HEADQUARTERS)).is.true;
      expect(player.production.megacredits).eq(2);
      // 10 M€ from the HQ, plus 1 because its infrastructure tag matches Lagrange's.
      expect(player.megaCredits).eq(11);
    });

    it('Planetary Engineering Corps: 5 energy and a card for 15 M€ off a standard project', () => {
      const pec = corp(player, new PlanetaryEngineeringCorps());
      expect(player.energy).eq(10);
      expect(player.production.energy).eq(2);
      player.megaCredits = 10;
      player.cardsInHand.push(card(CardName.BIRDS));
      const option = cast(HighOrbit.pecOption(player), SelectCard<IProjectCard>);
      const projects = cast(option.cb([player.cardsInHand[0]]), SelectStandardProjectToPlay);
      expect(player.energy).eq(5);
      expect(player.cardsInHand).is.empty;
      const city = projects.cards.find((c) => c.name === CardName.CITY_STANDARD_PROJECT)!;
      expect(city).is.not.undefined;
      expect(projects.extras.get(city.name)?.overriddenCost).eq(10);
      expect(pec.getStandardProjectDiscount(player, city)).eq(0);
    });

    it('Trojan Space Logistics: ore when anyone plays a blue card; 2 ore reuse a silver action', () => {
      const trojan = corp(player, new TrojanSpaceLogistics());
      player2.playCard(card(CardName.TARDIGRADES));
      runAllActions(game);
      expect(trojan.resourceCount).eq(1);
      player2.playCard(card(CardName.ASTEROID));
      runAllActions(game);
      expect(trojan.resourceCount).eq(1);
      trojan.resourceCount = 2;
      const hydro = give(player, CardName.HYDROPONICS);
      player.energy = 1;
      player.actionsThisGeneration.add(hydro.name);
      expect(trojan.canAct(player)).is.true;
      const select = cast(trojan.action(player), SelectCard<ICard>);
      select.cb([hydro]);
      expect(player.plants).eq(2);
      expect(trojan.resourceCount).eq(0);
    });

    it('Spacetek: titanium whenever anyone raises titanium production; others can use its action', () => {
      const spacetek = corp(player, new Spacetek());
      expect(player.production.titanium).eq(1);
      expect(player.titanium).eq(0);
      player2.production.add(Resource.TITANIUM, 2);
      expect(player.titanium).eq(2);
      player2.megaCredits = 13;
      const option = cast(HighOrbit.spacetekOptions(player2), SelectOption);
      option.cb(undefined);
      runAllActions(game);
      expect(player2.production.titanium).eq(3);
      expect(player.titanium).eq(3);
      expect(player2.megaCredits).eq(0);
      // Used once this generation, by anyone.
      player.megaCredits = 20;
      expect(spacetek.canAct(player)).is.false;
    });

    it('Judges of Change: science at each new even TR; draw one per player', () => {
      const judges = corp(player, new JudgesOfChange());
      expect(player.terraformRating).eq(22);
      expect(judges.resourceCount).eq(0);
      player.increaseTerraformRating(4);
      // 24 and 26.
      expect(judges.resourceCount).eq(2);
      player.decreaseTerraformRating(2);
      player.increaseTerraformRating(2);
      expect(judges.resourceCount).eq(2);
      judges.action(player);
      runAllActions(game);
      const keep = cast(player.popWaitingFor(), SelectCard);
      expect(keep.cards).has.length(2);
      expect(judges.getVictoryPoints(player)).eq(1);
      const restored = Game.deserialize(JSON.parse(JSON.stringify(game.serialize())));
      expect(cast(restored.getPlayerById(player.id).tableau.get(CardName.JUDGES_OF_CHANGE), JudgesOfChange).highestTR).eq(26);
    });
  });

  describe('held features unlocked', () => {
    it('Ore Refinery is dealt only with High Orbit', () => {
      const without = new GameCards({...DEFAULT_GAME_OPTIONS, postludesExpansion: true}).getPostludeCards();
      expect(without.map((c) => c.name)).not.includes(CardName.ORE_REFINERY);
      const withHO = new GameCards({...DEFAULT_GAME_OPTIONS, postludesExpansion: true, highOrbitExpansion: true}).getPostludeCards();
      expect(withHO.map((c) => c.name)).includes(CardName.ORE_REFINERY);
    });

    it('Ore Refinery has the infrastructure tag and counts ore for VP', () => {
      const refinery = new OreRefinery();
      expect(refinery.tags).includes(Tag.INFRASTRUCTURE);
      expect(refinery.resourceType).eq(CardResource.ORE);
      const mine = give(player, CardName.ASTEROID_MINE);
      mine.resourceCount = 5;
      player.playedCards.push(refinery);
      refinery.resourceCount = 3;
      expect(refinery.getVictoryPoints(player)).eq(2);
    });

    it('Ore Refinery: 1 ore per infrastructure tag, including its own', () => {
      const [g, p1, p2] = testGame(2, {highOrbitExpansion: true, postludesExpansion: true, individualTracks: true});
      give(p1, CardName.HYDROPONICS);
      p1.individualTracksData!.positions.oceans = 1;
      p1.megaCredits = 20;
      const ocean = addOcean(p2);
      const refinery = new OreRefinery();
      p1.playCard(refinery);
      runAllActions(g);
      const select = cast(p1.popWaitingFor(), SelectSpace);
      select.cb(ocean);
      runAllActions(g);
      // Hydroponics + Ore Refinery; the refinery is the only card holding ore.
      expect(refinery.resourceCount).eq(2);
      expect(ocean.tile?.postlude).eq(CardName.ORE_REFINERY);
    });

    it("Kuiper's Expansion counts infrastructure tags", () => {
      const [g, p] = testGame(2, {highOrbitExpansion: true, turmoilExtension: true, gigaTurmoil: true});
      p.tagsForTest = {infrastructure: 2};
      const turmoil = Turmoil.getTurmoil(g);
      const influence = turmoil.getInfluence(p);
      new KuipersExpansion().resolve(g);
      runAllActions(g);
      let input = p.popWaitingFor();
      let total = p.steel + p.titanium;
      while (input !== undefined) {
        // The ore can be steel or titanium; take whatever is offered first.
        if (input instanceof OrOptions) {
          input.options[0].cb(undefined);
        }
        runAllActions(g);
        input = p.popWaitingFor();
        total = p.steel + p.titanium;
      }
      expect(total).eq(2 + influence);
    });

    it('Construction of the Dyson Swarm: 2 M€ per infrastructure; TR for the most and second most', () => {
      const [g, p1, p2, p3] = testGame(3, {highOrbitExpansion: true, turmoilExtension: true, gigaTurmoil: true});
      p1.tagsForTest = {infrastructure: 3};
      p2.tagsForTest = {infrastructure: 1};
      p3.tagsForTest = {};
      p1.megaCredits = 10;
      p2.megaCredits = 10;
      p3.megaCredits = 10;
      const tr = [p1.terraformRating, p2.terraformRating, p3.terraformRating];
      new ConstructionOfTheDysonSwarm().resolve(g);
      expect(p1.megaCredits).eq(4);
      expect(p2.megaCredits).eq(8);
      expect(p3.megaCredits).eq(10);
      expect(p1.terraformRating).eq(tr[0] + 2);
      expect(p2.terraformRating).eq(tr[1] + 1);
      expect(p3.terraformRating).eq(tr[2]);
    });
  });
});
