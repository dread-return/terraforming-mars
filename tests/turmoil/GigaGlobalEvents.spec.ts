import {expect} from 'chai';
import {PartyName, GIGA_PARTIES} from '../../src/common/turmoil/PartyName';
import {GlobalEventName} from '../../src/common/turmoil/globalEvents/GlobalEventName';
import {GIGA_GLOBAL_EVENTS} from '../../src/server/turmoil/giga/GigaGlobalEvents';
import {GlobalEventDealer, getGlobalEventByName} from '../../src/server/turmoil/globalEvents/GlobalEventDealer';
import {IGlobalEvent} from '../../src/server/turmoil/globalEvents/IGlobalEvent';
import {GlobalEventManifest} from '../../src/server/cards/ModuleManifest';
import {BOARD_ORDER, Turmoil} from '../../src/server/turmoil/Turmoil';
import {IGame} from '../../src/server/IGame';
import {Game} from '../../src/server/Game';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {addCity, addGreenery, addOcean, fakeCard, runAllActions, setOxygenLevel, setTemperature} from '../TestingUtils';
import {cast} from '../../src/common/utils/utils';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectCard} from '../../src/server/inputs/SelectCard';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {SelectAmount} from '../../src/server/inputs/SelectAmount';
import {AndOptions} from '../../src/server/inputs/AndOptions';
import {Tag} from '../../src/common/cards/Tag';
import {CardType} from '../../src/common/cards/CardType';
import {CardResource} from '../../src/common/CardResource';
import {Resource} from '../../src/common/Resource';
import {Phase} from '../../src/common/Phase';
import {Luna} from '../../src/server/colonies/Luna';
import {Tardigrades} from '../../src/server/cards/base/Tardigrades';
import {GIGA_PARTIES_IN_PLAY} from '../../src/common/turmoil/PartyName';

const OPTIONS = {
  turmoilExtension: true,
  gigaTurmoil: true,
  politicalAgendasExtension: 'Chairman',
  coloniesExtension: true,
  venusNextExtension: true,
} as const;

function event(name: GlobalEventName): IGlobalEvent {
  return new GIGA_GLOBAL_EVENTS[name]!.Factory();
}

/** A Giga Turmoil game, past the party draft, with all the parties of `names` (and others) in play. */
function setup(...names: Array<PartyName>): [IGame, TestPlayer, TestPlayer] {
  const [game, player, player2] = testGame(2, OPTIONS);
  const turmoil = Turmoil.getTurmoil(game);
  const rest = BOARD_ORDER.filter((n) => !names.includes(n));
  turmoil.startGigaGovernment(game, [...names, ...rest].slice(0, GIGA_PARTIES_IN_PLAY));
  for (const p of game.players) {
    (p as TestPlayer).popWaitingFor();
  }
  return [game, player, player2];
}

function influence(game: IGame, player: TestPlayer, amount: number) {
  Turmoil.getTurmoil(game).addInfluenceBonus(player, amount);
}

function resolve(game: IGame, name: GlobalEventName) {
  // Global events resolve in the solar phase, when tiles have no owner and parameters give no TR.
  game.phase = Phase.SOLAR;
  event(name).resolve(game);
  runAllActions(game);
}

function pick(player: TestPlayer, index: number) {
  const options = cast(player.popWaitingFor(), OrOptions);
  cast(options.options[index], SelectOption).cb(undefined);
  runAllActions(player.game);
}

function cardsWithTags(player: TestPlayer, ...tags: Array<Tag>) {
  for (const tag of tags) {
    player.playedCards.push(fakeCard({tags: [tag]}));
  }
}

describe('Giga global events', () => {
  describe('catalogue', () => {
    const entries = GlobalEventManifest.entries(GIGA_GLOBAL_EVENTS);

    it('has the 30 events of the sheet, each with a different name', () => {
      expect(entries).has.length(30);
      expect(new Set(entries.map(([name]) => name)).size).eq(30);
      expect(new Set(entries.map(([, spec]) => new spec.Factory().description)).size).eq(30);
    });

    it('every event puts its neutral delegates on the Giga parties', () => {
      for (const [name, spec] of entries) {
        const e = new spec.Factory();
        expect(e.name).eq(name);
        expect(GIGA_PARTIES, name).includes(e.revealedDelegate);
        expect(GIGA_PARTIES, name).includes(e.currentDelegate);
        expect(e.renderData, name).is.not.undefined;
      }
    });

    it('events that need Colonies or Venus Next say so', () => {
      const compat = (name: GlobalEventName) => GIGA_GLOBAL_EVENTS[name]!.compatibility;
      expect(compat(GlobalEventName.POPULATION_COLLAPSES)).eq('colonies');
      expect(compat(GlobalEventName.SANCTION_ON_THE_OUTSKIRTS)).eq('colonies');
      expect(compat(GlobalEventName.INDEPENDENT_CARRIERS)).eq('colonies');
      expect(compat(GlobalEventName.VENUS_VOLCANISM)).eq('venus');
    });

    it('can be found by name, so saved games load', () => {
      for (const [name] of entries) {
        expect(getGlobalEventByName(name)?.name, name).eq(name);
      }
    });
  });

  describe('the deck', () => {
    const giga = new Set(GlobalEventManifest.keys(GIGA_GLOBAL_EVENTS));
    const gigaIn = (game: IGame) => GlobalEventDealer.newInstance(game).deck.filter((e) => giga.has(e.name));

    it('has every Giga event in a Giga Turmoil game with Colonies and Venus Next', () => {
      const [game] = testGame(2, OPTIONS);
      expect(gigaIn(game)).has.length(30);
    });

    it('leaves out the events that need Colonies or Venus Next when those are off', () => {
      const [game] = testGame(2, {turmoilExtension: true, gigaTurmoil: true, politicalAgendasExtension: 'Chairman'});
      const names = gigaIn(game).map((e) => e.name);
      expect(names).has.length(26);
      expect(names).not.includes(GlobalEventName.POPULATION_COLLAPSES);
      expect(names).not.includes(GlobalEventName.SANCTION_ON_THE_OUTSKIRTS);
      expect(names).not.includes(GlobalEventName.INDEPENDENT_CARRIERS);
      expect(names).not.includes(GlobalEventName.VENUS_VOLCANISM);
    });

    it('has no Giga event without Giga Turmoil', () => {
      const [game] = testGame(2, {turmoilExtension: true, coloniesExtension: true, venusNextExtension: true});
      expect(gigaIn(game)).is.empty;
    });

    it('the option that removes negative events removes the negative Giga events', () => {
      const [game] = testGame(2, {...OPTIONS, removeNegativeGlobalEventsOption: true});
      const names = gigaIn(game).map((e) => e.name);
      expect(names).has.length(24);
      expect(names).not.includes(GlobalEventName.FAVORITISM);
      expect(names).not.includes(GlobalEventName.RADICAL_GEOENGINEERING);
    });

    it('the Giga events are in the deck after the party draft, and the first ones put neutral delegates on parties in play', () => {
      const [game] = testGame(2, OPTIONS);
      for (let i = 0; i < 20 && Turmoil.getTurmoil(game).partyDraft !== undefined; i++) {
        for (const player of game.players) {
          if (Turmoil.getTurmoil(game).partyDraft?.waiting.includes(player.id)) {
            player.process({type: 'or', index: 0, response: {type: 'option'}});
          }
        }
      }
      const turmoil = Turmoil.getTurmoil(game);
      const inPlay = new Set(turmoil.parties.map((p) => p.name));
      for (const party of BOARD_ORDER) {
        if (!inPlay.has(party)) {
          expect(turmoil.getPartyByName(party).delegates.size, party).eq(0);
        }
      }
      expect(turmoil.comingGlobalEvent).is.not.undefined;
    });

    it('serializes and restores a game with Giga events in the deck', () => {
      const [game] = setup();
      const turmoil = Turmoil.getTurmoil(game);
      turmoil.globalEventDealer.deck.push(event(GlobalEventName.FAVORITISM));
      turmoil.comingGlobalEvent = event(GlobalEventName.LIFE_EXTENSION);

      const copy = Turmoil.getTurmoil(Game.deserialize(game.serialize()));

      expect(copy.comingGlobalEvent?.name).eq(GlobalEventName.LIFE_EXTENSION);
      expect(copy.globalEventDealer.deck.map((e) => e.name)).includes(GlobalEventName.FAVORITISM);
    });
  });

  describe('neutral delegates', () => {
    function sendEvent(game: IGame, revealed: PartyName): Turmoil {
      const turmoil = Turmoil.getTurmoil(game);
      const e = event(GlobalEventName.INTERSTELLAR_SIGNAL);
      Object.defineProperty(e, 'revealedDelegate', {value: revealed});
      turmoil.globalEventDealer.deck.push(e);
      turmoil.initGlobalEvent(game);
      return turmoil;
    }

    it('go on the party of the event when it is in play', () => {
      const [game] = setup(PartyName.BUREAUCRATS, PartyName.SPOME);
      const turmoil = Turmoil.getTurmoil(game);
      const before = turmoil.getPartyByName(PartyName.BUREAUCRATS).delegates.get('NEUTRAL');

      sendEvent(game, PartyName.BUREAUCRATS);

      expect(turmoil.getPartyByName(PartyName.BUREAUCRATS).delegates.get('NEUTRAL')).eq(before + 1);
    });

    it('go on a random party in play when the party was not drafted', () => {
      const seen = new Set<PartyName>();
      for (let i = 0; i < 40; i++) {
        const [game] = setup(PartyName.MARS, PartyName.GREENS);
        const turmoil = Turmoil.getTurmoil(game);
        const absent = BOARD_ORDER.find((name) => !turmoil.isInPlay(name))!;
        const count = (name: PartyName) => turmoil.getPartyByName(name).delegates.get('NEUTRAL');
        const before = new Map(turmoil.parties.map((p) => [p.name, count(p.name)]));

        sendEvent(game, absent);

        const changed = turmoil.parties.filter((p) => count(p.name) === before.get(p.name)! + 1);
        // The reveal of the first event also puts a neutral delegate on one party in play.
        expect(changed.length, absent).is.greaterThan(0);
        expect(turmoil.getPartyByName(absent).delegates.size).eq(0);
        changed.forEach((p) => seen.add(p.name));
      }
      expect(seen.size).is.greaterThan(1);
    });

    it('lose no delegate from the neutral reserve when none is placed', () => {
      const [game] = setup();
      const turmoil = Turmoil.getTurmoil(game);
      const absent = BOARD_ORDER.find((name) => !turmoil.isInPlay(name))!;
      const reserve = turmoil.delegateReserve.get('NEUTRAL');

      sendEvent(game, absent);

      // Both revealed events put one neutral delegate on the board, the same as for a party in play.
      expect(turmoil.delegateReserve.get('NEUTRAL')).eq(reserve - 2);
    });
  });

  describe('effects', () => {
    it('Interstellar Signal: draw 1 card per influence', () => {
      const [game, player] = setup();
      influence(game, player, 2);
      resolve(game, GlobalEventName.INTERSTELLAR_SIGNAL);
      expect(player.cardsInHand).has.length(2);
    });

    it("Kuiper's Expansion: gain ore per influence, steel or titanium", () => {
      const [game, player, player2] = setup();
      influence(game, player, 2);
      resolve(game, GlobalEventName.KUIPERS_EXPANSION);
      pick(player, 1);
      expect(player.titanium).eq(2);
      expect(player.steel).eq(0);
      expect(player2.getWaitingFor()).is.undefined;
    });

    describe('Radical Geoengineering', () => {
      it('first player raises one parameter and lowers a different one', () => {
        const [game, player] = setup();
        setOxygenLevel(game, 5);
        setTemperature(game, 0);
        addOcean(player);
        const first = game.playersInGenerationOrder[0] as TestPlayer;
        expect(first).eq(player);

        resolve(game, GlobalEventName.RADICAL_GEOENGINEERING);
        const raise = cast(player.popWaitingFor(), OrOptions);
        expect(raise.options.map((o) => o.title)).deep.eq(['Raise the oxygen level 1 step', 'Raise the temperature 1 step', 'Place an ocean tile']);
        cast(raise.options[0], SelectOption).cb(undefined);
        runAllActions(game);
        const lower = cast(player.popWaitingFor(), OrOptions);
        // The parameter that was raised cannot be lowered.
        expect(lower.options.map((o) => o.title)).deep.eq(['Lower the temperature 1 step', 'Remove an ocean tile']);
        cast(lower.options[0], SelectOption).cb(undefined);

        expect(game.getOxygenLevel()).eq(6);
        expect(game.getTemperature()).eq(-2);
      });

      it('a lowering that is the only one possible happens without asking', () => {
        const [game, player] = setup();
        setOxygenLevel(game, 5);
        setTemperature(game, 0);

        resolve(game, GlobalEventName.RADICAL_GEOENGINEERING);
        pick(player, 0);

        expect(player.getWaitingFor()).is.undefined;
        expect(game.getOxygenLevel()).eq(6);
        expect(game.getTemperature()).eq(-2);
      });

      it('each player loses steel per 5 TR over 15, reduced by influence', () => {
        const [game, player, player2] = setup();
        player.setTerraformRating(37); // 4 sets
        influence(game, player, 1);
        player.steel = 10;
        player2.setTerraformRating(20); // 1 set
        player2.steel = 10;

        resolve(game, GlobalEventName.RADICAL_GEOENGINEERING);
        // First player's prompt is open; the losses were queued behind it.
        pick(player, 2); // an ocean
        player.popWaitingFor();
        runAllActions(game);

        expect(player.steel).eq(7);
        expect(player2.steel).eq(9);
      });

      it('lowering costs no TR', () => {
        const [game, player] = setup();
        setOxygenLevel(game, 5);
        const tr = player.terraformRating;
        game.increaseOxygenLevel(player, -1);
        expect(game.getOxygenLevel()).eq(4);
        expect(player.terraformRating).eq(tr);
      });
    });

    it('Life Extension: 2 M€ per city and influence, 1 M€ lost per city tag', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      addCity(player);
      addCity(player);
      player.playedCards.push(fakeCard({tags: [Tag.CITY]}));
      resolve(game, GlobalEventName.LIFE_EXTENSION);
      // 2 cities + 1 influence: 6 M€, minus 1 for the city tag.
      expect(player.megaCredits).eq(5);
    });

    it('Loneliness in a Crowd: a resource of your choice per card without tags and influence', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      player.playedCards.push(fakeCard({tags: []}), fakeCard({tags: []}), fakeCard({tags: [Tag.SPACE]}), fakeCard({type: CardType.EVENT, tags: [Tag.EVENT]}));
      resolve(game, GlobalEventName.LONELINESS_IN_A_CROWD);
      const input = cast(player.popWaitingFor(), AndOptions);
      expect(input.options).has.length(6);
    });

    it("Mariner's Agreements: 2 M€ per city tag", () => {
      const [game, player] = setup();
      cardsWithTags(player, Tag.CITY, Tag.CITY, Tag.CITY, Tag.SPACE);
      resolve(game, GlobalEventName.MARINERS_AGREEMENTS);
      expect(player.megaCredits).eq(6);
    });

    it('Old Earth Reserve: animals per animal tag and influence', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      const card = fakeCard({resourceType: CardResource.ANIMAL, tags: [Tag.ANIMAL]});
      player.playedCards.push(card, fakeCard({tags: [Tag.ANIMAL]}));
      resolve(game, GlobalEventName.OLD_EARTH_RESERVE);
      expect(card.resourceCount).eq(3);
    });

    it('Overpopulation: lose an animal, gain microbes per microbe tag and influence', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      const animals = fakeCard({resourceType: CardResource.ANIMAL, tags: [Tag.ANIMAL]});
      animals.resourceCount = 3;
      const microbes = fakeCard({resourceType: CardResource.MICROBE, tags: [Tag.MICROBE]});
      player.playedCards.push(animals, microbes);
      resolve(game, GlobalEventName.OVERPOPULATION);
      expect(animals.resourceCount).eq(2);
      expect(microbes.resourceCount).eq(2);
    });

    it('Population Collapses: colony tracks go down, 2 M€ per colony', () => {
      const [game, player, player2] = setup();
      const luna = new Luna();
      game.colonies.length = 0;
      game.colonies.push(luna);
      luna.trackPosition = 4;
      luna.colonies.push(player.id, player.id);
      resolve(game, GlobalEventName.POPULATION_COLLAPSES);
      expect(luna.trackPosition).eq(3);
      expect(player.megaCredits).eq(4);
      expect(player2.megaCredits).eq(0);
    });

    it('Quantum Breakthrough: a card per 2 levels of energy production, influence counts', () => {
      const [game, player] = setup();
      player.production.add(Resource.ENERGY, 3);
      influence(game, player, 1);
      resolve(game, GlobalEventName.QUANTUM_BREAKTHROUGH);
      expect(player.cardsInHand).has.length(2);
    });

    describe('Sanction on the Outskirts', () => {
      it('lose ore per Jovian tag (max 5) reduced by influence, and colony tracks go up', () => {
        const [game, player] = setup();
        const luna = new Luna();
        game.colonies.length = 0;
        game.colonies.push(luna);
        luna.trackPosition = 2;
        cardsWithTags(player, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN);
        influence(game, player, 1);
        player.steel = 5;
        player.titanium = 5;

        resolve(game, GlobalEventName.SANCTION_ON_THE_OUTSKIRTS);
        // 5 (max) - 1 influence = 4 ore, split by the player.
        const amount = cast(player.popWaitingFor(), SelectAmount);
        expect(amount.min).eq(0);
        expect(amount.max).eq(4);
        amount.cb(3);

        expect(player.steel).eq(2);
        expect(player.titanium).eq(4);
        expect(luna.trackPosition).eq(3);
      });

      it('takes the only ore the player has without asking', () => {
        const [game, player] = setup();
        cardsWithTags(player, Tag.JOVIAN, Tag.JOVIAN);
        player.titanium = 1;
        resolve(game, GlobalEventName.SANCTION_ON_THE_OUTSKIRTS);
        expect(player.getWaitingFor()).is.undefined;
        expect(player.titanium).eq(0);
      });
    });

    it('Speciation of Humanity: the most different tags (minus influence) discard 2 cards', () => {
      const [game, player, player2] = setup();
      cardsWithTags(player, Tag.SPACE, Tag.EARTH, Tag.JOVIAN);
      cardsWithTags(player2, Tag.SPACE);
      player.cardsInHand.push(fakeCard(), fakeCard(), fakeCard());
      player2.cardsInHand.push(fakeCard(), fakeCard(), fakeCard());
      resolve(game, GlobalEventName.SPECIATION_OF_HUMANITY);
      const select = player.popWaitingFor();
      expect(select).is.not.undefined;
      expect(player2.getWaitingFor()).is.undefined;
      expect(player2.cardsInHand).has.length(3);
    });

    it('Speciation of Humanity: influence can hand the penalty to somebody else', () => {
      const [game, player, player2] = setup();
      cardsWithTags(player, Tag.SPACE, Tag.EARTH);
      cardsWithTags(player2, Tag.SPACE);
      influence(game, player, 2);
      player.cardsInHand.push(fakeCard(), fakeCard(), fakeCard());
      player2.cardsInHand.push(fakeCard());
      resolve(game, GlobalEventName.SPECIATION_OF_HUMANITY);
      // Score: player 0, player2 1.
      expect(player.getWaitingFor()).is.undefined;
      expect(player2.cardsInHand).is.empty;
    });

    it('Universal Uprising: plants per greenery and influence, then 5 M€ or 3 steel', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      addGreenery(player);
      resolve(game, GlobalEventName.UNIVERSAL_UPRISING);
      expect(player.plants).eq(2);
      const steel = player.steel;
      const megacredits = player.megaCredits;
      pick(player, 1);
      expect(player.steel).eq(steel + 3);
      expect(player.megaCredits).eq(megacredits);
    });

    it('Venus Volcanism: raises Venus 2 steps, 2 heat per Venus tag and influence', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      cardsWithTags(player, Tag.VENUS, Tag.VENUS, Tag.VENUS, Tag.VENUS, Tag.VENUS, Tag.VENUS);
      resolve(game, GlobalEventName.VENUS_VOLCANISM);
      expect(game.getVenusScaleLevel()).eq(4);
      // 5 (max) + 1 influence = 6 sets of 2 heat
      expect(player.heat).eq(12);
    });

    it('Anti-Government Sentiment: lose 5 M€ with 3 planet tags after influence', () => {
      const [game, player, player2] = setup();
      cardsWithTags(player, Tag.EARTH, Tag.JOVIAN, Tag.VENUS, Tag.MARS);
      cardsWithTags(player2, Tag.EARTH, Tag.JOVIAN, Tag.VENUS, Tag.MARS);
      influence(game, player2, 2);
      player.megaCredits = 10;
      player2.megaCredits = 10;
      resolve(game, GlobalEventName.ANTI_GOVERNMENT_SENTIMENT);
      expect(player.megaCredits).eq(5);
      expect(player2.megaCredits).eq(10);
    });

    it('Atmospheric Ports: 2 M€ per card with floaters and influence', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      const withFloaters = fakeCard({resourceType: CardResource.FLOATER});
      withFloaters.resourceCount = 2;
      const empty = fakeCard({resourceType: CardResource.FLOATER});
      player.playedCards.push(withFloaters, empty);
      resolve(game, GlobalEventName.ATMOSPHERIC_PORTS);
      expect(player.megaCredits).eq(4);
    });

    describe('Belt Tightening Policy', () => {
      it('lose M€ per 2 automated cards reduced by influence, and discard an active card', () => {
        const [game, player] = setup();
        influence(game, player, 1);
        for (let i = 0; i < 5; i++) {
          player.playedCards.push(fakeCard({type: CardType.AUTOMATED}));
        }
        player.megaCredits = 10;
        const active = fakeCard({type: CardType.ACTIVE});
        player.cardsInHand.push(active, fakeCard({type: CardType.AUTOMATED}));
        resolve(game, GlobalEventName.BELT_TIGHTENING_POLICY);
        // 2 sets - 1 influence = 1 set
        expect(player.megaCredits).eq(8);
        // Only discarding is possible: no resources on cards. A single choice goes straight to the card prompt.
        const select = player.popWaitingFor();
        expect(select).is.not.undefined;
      });

      it('asks what to give up when both are possible', () => {
        const [game, player] = setup();
        const card = fakeCard({resourceType: CardResource.FLOATER});
        card.resourceCount = 3;
        player.playedCards.push(card);
        player.cardsInHand.push(fakeCard({type: CardType.ACTIVE}));
        resolve(game, GlobalEventName.BELT_TIGHTENING_POLICY);
        const options = cast(player.popWaitingFor(), OrOptions);
        expect(options.options).has.length(2);
        cast(options.options[1], SelectOption).cb(undefined);
        runAllActions(game);
        expect(card.resourceCount).eq(1);
      });

      it('does nothing more when there is nothing to give up', () => {
        const [game, player] = setup();
        player.cardsInHand.push(fakeCard({type: CardType.AUTOMATED}));
        resolve(game, GlobalEventName.BELT_TIGHTENING_POLICY);
        expect(player.getWaitingFor()).is.undefined;
      });
    });

    it('Black Swan Manifestation: a card per 3 science tags, influence counts', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      cardsWithTags(player, Tag.SCIENCE, Tag.SCIENCE);
      resolve(game, GlobalEventName.BLACK_SWAN_MANIFESTATION);
      expect(player.cardsInHand).has.length(1);
    });

    it('Brain-Machine Coupling: a delegate per 2 cities, influence counts as cities', () => {
      const [game, player] = setup();
      const turmoil = Turmoil.getTurmoil(game);
      influence(game, player, 1);
      addCity(player);
      addCity(player);
      addCity(player);
      const before = turmoil.delegateReserve.get(player);
      resolve(game, GlobalEventName.BRAIN_MACHINE_COUPLING);
      expect(turmoil.delegateReserve.get(player)).eq(before + 2);
    });

    describe('Closed Biospheres', () => {
      it('lower plant production to gain titanium, plus influence', () => {
        const [game, player] = setup();
        influence(game, player, 1);
        player.production.add(Resource.PLANTS, 2);
        resolve(game, GlobalEventName.CLOSED_BIOSPHERES);
        const options = cast(player.popWaitingFor(), OrOptions);
        // No card holds floaters: titanium, steel and doing nothing.
        expect(options.options).has.length(3);
        cast(options.options[0], SelectOption).cb(undefined);
        expect(player.production.plants).eq(1);
        expect(player.titanium).eq(4);
      });

      it('floaters are offered when a card can hold them', () => {
        const [game, player] = setup();
        player.production.add(Resource.PLANTS, 1);
        const card = fakeCard({resourceType: CardResource.FLOATER});
        player.playedCards.push(card);
        resolve(game, GlobalEventName.CLOSED_BIOSPHERES);
        const options = cast(player.popWaitingFor(), OrOptions);
        expect(options.options).has.length(4);
        cast(options.options[0], SelectOption).cb(undefined);
        runAllActions(game);
        expect(card.resourceCount).eq(2);
      });

      it('may be declined, and needs plant production', () => {
        const [game, player, player2] = setup();
        player.production.add(Resource.PLANTS, 1);
        resolve(game, GlobalEventName.CLOSED_BIOSPHERES);
        const options = cast(player.popWaitingFor(), OrOptions);
        cast(options.options[options.options.length - 1], SelectOption).cb(undefined);
        expect(player.production.plants).eq(1);
        expect(player2.getWaitingFor()).is.undefined;
      });
    });

    it('Cybernetic: titanium production with 5 science tags, influence counts', () => {
      const [game, player, player2] = setup();
      cardsWithTags(player, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE);
      cardsWithTags(player2, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE);
      influence(game, player, 1);
      resolve(game, GlobalEventName.CYBERNETIC);
      expect(player.production.titanium).eq(1);
      expect(player2.production.titanium).eq(0);
    });

    it('Digitalization: lose M€ per city and colony, then activate two cards again', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      addCity(player);
      addCity(player);
      const tardigrades = new Tardigrades();
      player.playedCards.push(tardigrades);
      player.megaCredits = 10;

      resolve(game, GlobalEventName.DIGITALIZATION);
      // 2 cities - 1 influence = 1 set
      expect(player.megaCredits).eq(8);
      const options = cast(player.popWaitingFor(), OrOptions);
      expect(options.options).has.length(2);
      const selectCard = cast(options.options[0], SelectCard);
      expect(selectCard.cards.map((c) => c.name)).deep.eq([tardigrades.name]);
      selectCard.process({type: 'card', cards: [tardigrades.name]});
      runAllActions(game);
      expect(tardigrades.resourceCount).eq(1);
      // A second activation is offered.
      expect(player.popWaitingFor()).instanceOf(OrOptions);
    });

    it('Construction of the Dyson Swarm: nothing yet, without the infrastructure tag', () => {
      const [game, player] = setup();
      player.megaCredits = 7;
      resolve(game, GlobalEventName.CONSTRUCTION_OF_THE_DYSON_SWARM);
      expect(player.megaCredits).eq(7);
      expect(player.getWaitingFor()).is.undefined;
    });

    it('Effects of Radiation: lose energy reduced by influence, 2 M€ per energy tag', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      player.energy = 10;
      cardsWithTags(player, Tag.POWER, Tag.POWER);
      resolve(game, GlobalEventName.EFFECTS_OF_RADIATION);
      expect(player.energy).eq(7);
      expect(player.megaCredits).eq(4);
    });

    it('Energy Economics: gain energy, lose M€ per energy tag (max 5) reduced by influence', () => {
      const [game, player] = setup();
      influence(game, player, 1);
      for (let i = 0; i < 6; i++) {
        cardsWithTags(player, Tag.POWER);
      }
      player.megaCredits = 20;
      resolve(game, GlobalEventName.ENERGY_ECONOMICS);
      expect(player.energy).eq(3);
      // (5 - 1) * 2
      expect(player.megaCredits).eq(12);
    });

    it('Extraterrestrial Politics: 4 planet tags (influence counts) choose titanium, steel or M€', () => {
      const [game, player, player2] = setup();
      influence(game, player, 1);
      cardsWithTags(player, Tag.EARTH, Tag.JOVIAN, Tag.VENUS);
      cardsWithTags(player2, Tag.EARTH, Tag.JOVIAN, Tag.VENUS);
      resolve(game, GlobalEventName.EXTRATERRESTRIAL_POLITICS);
      pick(player, 1);
      expect(player.steel).eq(4);
      expect(player2.getWaitingFor()).is.undefined;
    });

    it('Favoritism: lose 5 delegates from the reserve, reduced per 3 cards in hand', () => {
      const [game, player, player2] = setup();
      const turmoil = Turmoil.getTurmoil(game);
      const reserve = turmoil.delegateReserve.get(player);
      player2.cardsInHand.push(fakeCard(), fakeCard(), fakeCard(), fakeCard(), fakeCard(), fakeCard());
      const reserve2 = turmoil.delegateReserve.get(player2);
      resolve(game, GlobalEventName.FAVORITISM);
      expect(turmoil.delegateReserve.get(player)).eq(reserve - 5);
      expect(turmoil.delegateReserve.get(player2)).eq(reserve2 - 3);
    });

    it('Favoritism: cannot lose more delegates than the reserve holds, and not those on parties', () => {
      const [game, player] = setup();
      const turmoil = Turmoil.getTurmoil(game);
      while (turmoil.delegateReserve.get(player) > 3) {
        turmoil.sendDelegateToParty(player, turmoil.parties[0].name, game);
      }
      const placed = turmoil.parties[0].delegates.get(player);
      resolve(game, GlobalEventName.FAVORITISM);
      expect(turmoil.delegateReserve.get(player)).eq(0);
      expect(turmoil.parties[0].delegates.get(player)).eq(placed);
    });

    it('Financial Crisis: gain 5 M€, lower M€ production per 5 TR over 15 and influence', () => {
      const [game, player] = setup();
      player.setTerraformRating(30);
      influence(game, player, 1);
      resolve(game, GlobalEventName.FINANCIAL_CRISIS);
      expect(player.megaCredits).eq(5);
      // 3 sets + 1 influence
      expect(player.production.megacredits).eq(-4);
    });

    it('Financial Crisis: M€ production stops at -5', () => {
      const [game, player] = setup();
      player.setTerraformRating(45);
      influence(game, player, 3);
      resolve(game, GlobalEventName.FINANCIAL_CRISIS);
      expect(player.production.megacredits).eq(-5);
    });

    it('Illegal Orbiting: lose M€ per Earth tag, most space tags raise titanium production', () => {
      const [game, player, player2] = setup();
      cardsWithTags(player, Tag.EARTH, Tag.EARTH, Tag.EARTH, Tag.SPACE, Tag.SPACE);
      cardsWithTags(player2, Tag.SPACE);
      influence(game, player, 1);
      player.megaCredits = 10;
      resolve(game, GlobalEventName.ILLEGAL_ORBITING);
      expect(player.megaCredits).eq(8);
      expect(player.production.titanium).eq(1);
      expect(player2.production.titanium).eq(0);
    });

    it('Illegal Orbiting: nobody gains titanium production without space tags', () => {
      const [game, player, player2] = setup();
      resolve(game, GlobalEventName.ILLEGAL_ORBITING);
      expect(player.production.titanium).eq(0);
      expect(player2.production.titanium).eq(0);
    });

    it('Independent Carriers: colony bonus per influence, colony tracks go down', () => {
      const [game, player] = setup();
      const luna = new Luna();
      game.colonies.length = 0;
      game.colonies.push(luna);
      luna.trackPosition = 4;
      luna.colonies.push(player.id);
      influence(game, player, 2);
      resolve(game, GlobalEventName.INDEPENDENT_CARRIERS);
      // Luna's colony bonus is 2 M€ (once per influence).
      expect(player.megaCredits).eq(4);
      expect(luna.trackPosition).eq(3);
    });
  });
});
