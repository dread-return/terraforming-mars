import {expect} from 'chai';
import {GIGA_PARTIES_IN_PLAY, OFFICIAL_PARTIES, PartyName} from '../../src/common/turmoil/PartyName';
import {Game} from '../../src/server/Game';
import {IGame} from '../../src/server/IGame';
import {BOARD_ORDER, Turmoil, ALL_GIGA_PARTIES, ALL_PARTIES} from '../../src/server/turmoil/Turmoil';
import {PoliticalAgendas} from '../../src/server/turmoil/PoliticalAgendas';
import {PartyHooks} from '../../src/server/turmoil/parties/PartyHooks';
import {GigaHooks} from '../../src/server/turmoil/giga/GigaHooks';
import {AndOptions} from '../../src/server/inputs/AndOptions';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {fakeCard, runAllActions, setRulingParty} from '../TestingUtils';
import {cast} from '@/common/utils/utils';
import {Payment} from '../../src/common/inputs/Payment';
import {Phase} from '../../src/common/Phase';
import {BONUS_IDS, POLICY_IDS, isGigaAgendaId} from '../../src/common/turmoil/Types';
import {chairmanWheelInput, availableWheelRewards, OUTER_RING_GENERATION} from '../../src/server/turmoil/ChairmanWheel';
import {Tag} from '../../src/common/cards/Tag';
import {CardResource} from '../../src/common/CardResource';
import {CardType} from '../../src/common/cards/CardType';
import {TileType} from '../../src/common/TileType';
import {Resource} from '../../src/common/Resource';
import {Space} from '../../src/server/boards/Space';
import {PowerPlantStandardProject} from '../../src/server/cards/base/standardProjects/PowerPlantStandardProject';
import {Tardigrades} from '../../src/server/cards/base/Tardigrades';
import {CardName} from '../../src/common/cards/CardName';
import {partiesPerPlayer, startPartyDraft} from '../../src/server/turmoil/giga/PartyDraft';
import {SelectInitialCards} from '../../src/server/inputs/SelectInitialCards';
import {SelectCard} from '../../src/server/inputs/SelectCard';
import {IProjectCard} from '../../src/server/cards/IProjectCard';

const GIGA_OPTIONS = {turmoilExtension: true, gigaTurmoil: true, politicalAgendasExtension: 'Chairman'} as const;

/** Gets a Giga Turmoil game past its party draft with exactly these parties (the rest are filled in) in play. */
function gigaGame(...names: Array<PartyName>): [IGame, TestPlayer, TestPlayer] {
  const [game, player, player2] = testGame(2, GIGA_OPTIONS);
  startWith(game, ...names);
  return [game, player, player2];
}

function startWith(game: IGame, ...names: Array<PartyName>): Turmoil {
  const turmoil = Turmoil.getTurmoil(game);
  const rest = BOARD_ORDER.filter((n) => !names.includes(n));
  turmoil.startGigaGovernment(game, [...names, ...rest].slice(0, GIGA_PARTIES_IN_PLAY));
  for (const player of game.players) {
    (player as TestPlayer).popWaitingFor();
  }
  // Start from known agendas: every party has its default bonus and policy.
  for (const party of turmoil.parties) {
    turmoil.politicalAgendasData.agendas.set(party.name, {bonusId: party.bonuses[0].id, policyId: party.policies[0].id});
  }
  // The ruling party is random, so policies stay inactive (they only work in the action phase) until a test
  // calls setRulingParty.
  game.phase = Phase.RESEARCH;
  return turmoil;
}

function bonusOf(game: IGame, partyName: PartyName, id: string) {
  const bonus = Turmoil.getTurmoil(game).getPartyByName(partyName).bonuses.find((b) => b.id === id);
  if (bonus === undefined) {
    throw new Error('No bonus ' + id);
  }
  return bonus;
}

function policyOf(game: IGame, partyName: PartyName, id: string) {
  const policy = Turmoil.getTurmoil(game).getPartyByName(partyName).policies.find((p) => p.id === id);
  if (policy === undefined) {
    throw new Error('No policy ' + id);
  }
  return policy;
}

/** A land space with no placement bonus, so tests only see the effect of the policy. */
function plainSpace(game: IGame, player: TestPlayer): Space {
  return game.board.getAvailableSpacesOnLand(player).find((s) => s.bonus.length === 0)!;
}

/**
 * A Giga Turmoil test game with the party draft dealt. testGame skips the initial card selection, which is what
 * normally starts the draft.
 */
function draftGame(count: number): [IGame, ...Array<TestPlayer>] {
  const result = testGame(count, GIGA_OPTIONS);
  startPartyDraft(result[0], () => {});
  return result;
}

/** Every waiting player takes the first party in their hand, until the draft is over. */
function finishDraft(game: IGame): void {
  const turmoil = Turmoil.getTurmoil(game);
  for (let i = 0; turmoil.partyDraft !== undefined; i++) {
    expect(i, 'draft did not finish').lessThan(50);
    for (const player of game.players) {
      if (turmoil.partyDraft?.waiting.includes(player.id)) {
        player.process({type: 'or', index: 0, response: {type: 'option'}});
      }
    }
  }
}

describe('Giga Turmoil', () => {
  describe('party catalogue', () => {
    it('every party has bonuses and policies with known Giga ids', () => {
      for (const name of Object.values(PartyName)) {
        const party = new ALL_GIGA_PARTIES[name]();
        expect(party.name).eq(name);
        expect(party.bonuses.length, name).is.greaterThan(0);
        expect(party.policies.length, name).is.greaterThan(0);
        for (const bonus of party.bonuses) {
          expect(BONUS_IDS, `${name} ${bonus.id}`).includes(bonus.id);
          expect(isGigaAgendaId(bonus.id)).is.true;
          expect(bonus.description).is.not.empty;
        }
        for (const policy of party.policies) {
          expect(POLICY_IDS, `${name} ${policy.id}`).includes(policy.id);
          expect(isGigaAgendaId(policy.id)).is.true;
          expect(policy.description).is.not.empty;
        }
      }
    });

    it('the ids of a party all start with the same letter, bonuses with b and policies with p', () => {
      for (const name of Object.values(PartyName)) {
        const party = new ALL_GIGA_PARTIES[name]();
        const letter = party.bonuses[0].id[0];
        for (const bonus of party.bonuses) {
          expect(bonus.id[0]).eq(letter);
          expect(bonus.id[1]).eq('b');
        }
        for (const policy of party.policies) {
          expect(policy.id[0]).eq(letter);
          expect(policy.id[1]).eq('p');
        }
      }
    });

    it('the first bonus and policy of each party are the defaults (bonus A and policy 1)', () => {
      for (const name of Object.values(PartyName)) {
        const party = new ALL_GIGA_PARTIES[name]();
        expect(party.bonuses[0].id.endsWith('b01'), name).is.true;
        expect(party.policies[0].id.endsWith('p01'), name).is.true;
      }
    });

    it('the parties that are missing parts of the game have fewer options', () => {
      const count = (name: PartyName) => {
        const party = new ALL_GIGA_PARTIES[name]();
        return [party.bonuses.length, party.policies.length];
      };
      // Held for later, see claude/giga-turmoil.md: individual tracks, populations and factions, postludes,
      // the city track and town tiles.
      expect(count(PartyName.KELVINISTS)).deep.eq([1, 4]);
      expect(count(PartyName.POPULISTS)).deep.eq([1, 3]);
      expect(count(PartyName.SPOME)).deep.eq([2, 3]);
      expect(count(PartyName.TRANSHUMANISTS)).deep.eq([2, 2]);
      for (const name of [PartyName.MARS, PartyName.SCIENTISTS, PartyName.UNITY, PartyName.GREENS, PartyName.REDS, PartyName.BUREAUCRATS, PartyName.CENTRISTS, PartyName.EMPOWER]) {
        expect(count(name), name).deep.eq([2, 4]);
      }
    });

    it('standard Turmoil keeps its own bonuses and policies', () => {
      for (const name of OFFICIAL_PARTIES) {
        const party = new ALL_PARTIES[name as keyof typeof ALL_PARTIES]();
        for (const bonus of party.bonuses) {
          expect(isGigaAgendaId(bonus.id)).is.false;
        }
        for (const policy of party.policies) {
          expect(isGigaAgendaId(policy.id)).is.false;
        }
      }
    });
  });

  describe('party draft', () => {
    it('a standard Turmoil game has the six standard parties and no draft', () => {
      const [game] = testGame(2, {turmoilExtension: true});
      const turmoil = Turmoil.getTurmoil(game);
      expect(turmoil.gigaTurmoil).is.false;
      expect(turmoil.partyDraft).is.undefined;
      expect(turmoil.parties.map((p) => p.name)).deep.eq([...OFFICIAL_PARTIES]);
    });

    it('each player is dealt the same number of parties', () => {
      expect(partiesPerPlayer(1)).eq(12);
      expect(partiesPerPlayer(2)).eq(6);
      expect(partiesPerPlayer(3)).eq(4);
      expect(partiesPerPlayer(4)).eq(3);
      expect(partiesPerPlayer(5)).eq(2);
      expect(partiesPerPlayer(6)).eq(2);
    });

    it('deals the parties and asks every player to choose', () => {
      const [game, p1, p2, p3] = draftGame(3);
      const draft = Turmoil.getTurmoil(game).partyDraft!;
      expect(draft.hands.map((h) => h.length)).deep.eq([4, 4, 4]);
      expect(new Set(draft.hands.flat()).size).eq(12);
      expect(draft.picked).is.empty;
      expect(draft.waiting).to.have.members([p1.id, p2.id, p3.id]);
      for (const player of [p1, p2, p3]) {
        expect(player.getWaitingFor()).instanceOf(OrOptions);
      }
    });

    it('does not start the government until the draft is over', () => {
      const [game] = testGame(2, GIGA_OPTIONS);
      const turmoil = Turmoil.getTurmoil(game);
      expect(turmoil.comingGlobalEvent).is.undefined;
      expect(turmoil.parties).has.length(12);
    });

    it('everybody passes what they have left to the next player', () => {
      const [game, p1, p2, p3] = draftGame(3);
      const draft = Turmoil.getTurmoil(game).partyDraft!;
      const before = draft.hands.map((h) => [...h]);

      for (const player of [p1, p2, p3]) {
        player.process({type: 'or', index: 0, response: {type: 'option'}});
      }

      expect(draft.picked).deep.eq([before[0][0], before[1][0], before[2][0]]);
      // Player 1 now holds what player 3 had left, and so on.
      expect(draft.hands[0]).deep.eq(before[2].slice(1));
      expect(draft.hands[1]).deep.eq(before[0].slice(1));
      expect(draft.hands[2]).deep.eq(before[1].slice(1));
      expect(draft.waiting).to.have.members([p1.id, p2.id, p3.id]);
    });

    for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
      it(`puts six different parties in play with ${count} player(s)`, () => {
        const [game] = draftGame(count);
        finishDraft(game);
        const turmoil = Turmoil.getTurmoil(game);
        const names = turmoil.parties.map((p) => p.name);
        expect(names).has.length(GIGA_PARTIES_IN_PLAY);
        expect(new Set(names).size).eq(GIGA_PARTIES_IN_PLAY);
        expect(names).deep.eq(BOARD_ORDER.filter((n) => names.includes(n)));
        expect(turmoil.partyDraft).is.undefined;
      });
    }

    it('chooses the starting party at random from the parties in play, and gives it a bonus and policy', () => {
      for (let i = 0; i < 20; i++) {
        const [game] = draftGame(2);
        finishDraft(game);
        const turmoil = Turmoil.getTurmoil(game);
        expect(turmoil.parties).includes(turmoil.rulingParty);
        // The first two global events place neutral delegates, which can change which party is dominant.
        expect(turmoil.parties).includes(turmoil.dominantParty);
        expect(turmoil.chairman).eq('NEUTRAL');
        const agenda = PoliticalAgendas.currentAgenda(turmoil);
        expect(turmoil.rulingParty.bonuses.map((b) => b.id)).includes(agenda.bonusId);
        expect(turmoil.rulingParty.policies.map((p) => p.id)).includes(agenda.policyId);
        expect(turmoil.politicalAgendasData.agendaStyle).eq('Chairman');
      }
    });

    it('draws the first global events once the draft is over', () => {
      const [game] = draftGame(2);
      finishDraft(game);
      const turmoil = Turmoil.getTurmoil(game);
      expect(turmoil.comingGlobalEvent).is.not.undefined;
      expect(turmoil.distantGlobalEvent).is.not.undefined;
    });

    it('starts after everybody chose their initial cards, and plays the corporations after it', () => {
      const [game, p1, p2] = testGame(2, {...GIGA_OPTIONS, skipInitialCardSelection: false});
      const turmoil = Turmoil.getTurmoil(game);
      expect(turmoil.partyDraft).is.undefined;
      expect(turmoil.awaitingPartyDraft()).is.true;

      for (const player of [p1, p2]) {
        const selectInitialCards = cast(player.getWaitingFor(), SelectInitialCards);
        player.process({type: 'initialCards', responses: [
          {type: 'card', cards: [cast(selectInitialCards.options[0], SelectCard).cards[0].name]},
          {type: 'card', cards: []},
        ]});
        if (player === p1) {
          // Not everybody has chosen yet.
          expect(turmoil.partyDraft).is.undefined;
        }
      }

      expect(turmoil.partyDraft).is.not.undefined;
      expect(p1.getWaitingFor()).instanceOf(OrOptions);
      expect(p1.playedCards.corporations()).is.empty;
      expect(p2.playedCards.corporations()).is.empty;

      finishDraft(game);
      expect(turmoil.awaitingPartyDraft()).is.false;
      expect(p1.playedCards.corporations()).has.length(1);
      expect(p2.playedCards.corporations()).has.length(1);
    });

    it('a game restored in the middle of the draft plays the corporations after it', () => {
      const [game, p1, p2] = testGame(2, {...GIGA_OPTIONS, skipInitialCardSelection: false});
      for (const player of [p1, p2]) {
        const selectInitialCards = cast(player.getWaitingFor(), SelectInitialCards);
        player.process({type: 'initialCards', responses: [
          {type: 'card', cards: [cast(selectInitialCards.options[0], SelectCard).cards[0].name]},
          {type: 'card', cards: []},
        ]});
      }
      const copy = Game.deserialize(game.serialize());
      finishDraft(copy);
      for (const player of copy.players) {
        expect(player.playedCards.corporations()).has.length(1);
      }
    });

    it('serializes and restores the game in the middle of the draft', () => {
      const [game, p1] = draftGame(3);
      p1.process({type: 'or', index: 1, response: {type: 'option'}});
      const draft = Turmoil.getTurmoil(game).partyDraft!;

      const copy = Game.deserialize(game.serialize());
      const copyDraft = Turmoil.getTurmoil(copy).partyDraft!;

      expect(copyDraft).deep.eq(draft);
      // Player 1 already chose, the others are asked again.
      expect(copy.players[0].getWaitingFor()).is.undefined;
      expect(copy.players[1].getWaitingFor()).instanceOf(OrOptions);
      expect(copy.players[2].getWaitingFor()).instanceOf(OrOptions);

      finishDraft(copy);
      expect(Turmoil.getTurmoil(copy).parties).has.length(GIGA_PARTIES_IN_PLAY);
    });

    it('serializes and deserializes the parties in play', () => {
      const [game] = gigaGame(PartyName.SPOME, PartyName.EMPOWER, PartyName.GREENS);
      const names = Turmoil.getTurmoil(game).parties.map((p) => p.name);

      const copy = Game.deserialize(game.serialize());
      const copyTurmoil = Turmoil.getTurmoil(copy);

      expect(copyTurmoil.gigaTurmoil).is.true;
      expect(copyTurmoil.partyDraft).is.undefined;
      expect(copyTurmoil.parties.map((p) => p.name)).deep.eq(names);
      expect(copyTurmoil.isInPlay(PartyName.SPOME)).is.true;
      // The restored parties are the Giga versions.
      expect(copyTurmoil.getPartyByName(PartyName.GREENS).policies[0].id).eq('Gp01');
    });

    it('parties that are not in play can be looked up, but do not get delegates', () => {
      const [game] = gigaGame(PartyName.GREENS);
      const turmoil = Turmoil.getTurmoil(game);
      const absent = BOARD_ORDER.find((n) => !turmoil.isInPlay(n))!;
      expect(turmoil.getPartyByName(absent).name).eq(absent);
      const reserve = turmoil.delegateReserve.get('NEUTRAL');

      turmoil.sendDelegateToParty('NEUTRAL', absent, game);

      expect(turmoil.getPartyByName(absent).delegates.size).eq(0);
      expect(turmoil.delegateReserve.get('NEUTRAL')).eq(reserve);
    });
  });

  describe('agendas', () => {
    it('a human chairman picks a bonus and a policy together', () => {
      const [game, player] = gigaGame(PartyName.CENTRISTS, PartyName.GREENS);
      const turmoil = Turmoil.getTurmoil(game);
      turmoil.rulingParty = turmoil.getPartyByName(PartyName.CENTRISTS);
      turmoil.chairman = player;

      PoliticalAgendas.setNextAgenda(turmoil, game);
      const andOptions = cast(game.deferredActions.pop()!.execute(), AndOptions);
      const bonuses = cast(andOptions.options[0], OrOptions);
      const policies = cast(andOptions.options[1], OrOptions);
      expect(bonuses.options).has.length(2);
      expect(policies.options).has.length(4);

      // Give the players tags so that the bonus pays out something.
      player.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.SPACE]}));
      player.megaCredits = 0;
      const logsBefore = game.gameLog.length;

      // Choose the second bonus and the third policy. Nothing happens until both are chosen.
      cast(bonuses.options[1], SelectOption).cb(undefined);
      cast(policies.options[2], SelectOption).cb(undefined);
      expect(game.gameLog.length).eq(logsBefore);
      andOptions.cb(undefined);

      expect(PoliticalAgendas.currentAgenda(turmoil)).deep.eq({bonusId: 'Cb02', policyId: 'Cp03'});
      expect(game.gameLog.length).is.greaterThan(logsBefore);
    });

    it('a neutral chairman gives the default bonus and policy', () => {
      const [game] = gigaGame(PartyName.CENTRISTS, PartyName.GREENS);
      const turmoil = Turmoil.getTurmoil(game);
      turmoil.rulingParty = turmoil.getPartyByName(PartyName.CENTRISTS);
      turmoil.politicalAgendasData.agendas.set(PartyName.CENTRISTS, {bonusId: 'Cb02', policyId: 'Cp03'});
      turmoil.chairman = 'NEUTRAL';

      PoliticalAgendas.setNextAgenda(turmoil, game);

      expect(PoliticalAgendas.currentAgenda(turmoil)).deep.eq({bonusId: 'Cb01', policyId: 'Cp01'});
    });
  });

  describe('chairman wheel', () => {
    it('inner ring only before the outer ring opens', () => {
      const [, player] = gigaGame();
      const early = availableWheelRewards(player, OUTER_RING_GENERATION - 1).map((r) => r.description);
      const late = availableWheelRewards(player, OUTER_RING_GENERATION).map((r) => r.description);
      expect(late.length).is.greaterThan(early.length);
      expect(early).includes('Raise your terraform rating 1 step');
      expect(early).not.includes('Raise your terraform rating 2 steps');
      expect(late).includes('Raise your terraform rating 2 steps');
    });

    it('the Mars track is only offered with Pathfinders', () => {
      const [, player] = gigaGame();
      const rewards = availableWheelRewards(player, 1).map((r) => r.description);
      expect(rewards.some((d) => d.includes('Mars track'))).is.false;
    });

    it('a new human chairman gets to pick, and gets the reward', () => {
      const [game, player] = gigaGame(PartyName.GREENS);
      const turmoil = Turmoil.getTurmoil(game);
      turmoil.chairman = 'NEUTRAL';
      player.megaCredits = 0;
      const tr = player.terraformRating;

      turmoil.setNewChairman(player, game, /* setAgenda= */ false);
      // The flat +1 TR is one of the choices (and not given automatically)
      const wheel = cast(game.deferredActions.pop()!.execute(), OrOptions);
      expect(player.terraformRating).eq(tr);
      const eightMC = wheel.options.find((o) => o.title.toString().includes('8 M€'))!;
      cast(eightMC, SelectOption).cb(undefined);

      expect(player.megaCredits).eq(8);
      expect(player.terraformRating).eq(tr);
    });

    it('rewards: terraform rating, production, cards', () => {
      const [game, player] = gigaGame();
      game.generation = OUTER_RING_GENERATION;
      const choose = (text: string) => {
        const wheel = cast(chairmanWheelInput(player), OrOptions);
        cast(wheel.options.find((o) => o.title.toString() === text)!, SelectOption).cb(undefined);
        runAllActions(game);
      };
      const tr = player.terraformRating;
      choose('Raise your terraform rating 2 steps');
      expect(player.terraformRating).eq(tr + 2);

      choose('Increase your M€ production 5 steps');
      expect(player.production.megacredits).eq(5);

      const hand = player.cardsInHand.length;
      choose('Draw 5 cards');
      expect(player.cardsInHand.length).eq(hand + 5);
    });

    it('the chairman wheel is not used without Giga Turmoil', () => {
      const [game, player] = testGame(2, {turmoilExtension: true});
      const turmoil = Turmoil.getTurmoil(game);
      const tr = player.terraformRating;
      turmoil.setNewChairman(player, game, false);
      runAllActions(game);
      expect(player.terraformRating).eq(tr + 1);
    });
  });

  describe('bonuses', () => {
    it('Mars First: building and Mars tags, tiles on Mars', () => {
      const [game, player] = gigaGame(PartyName.MARS);
      player.tagsForTest = {[Tag.BUILDING]: 2, [Tag.MARS]: 3, [Tag.SPACE]: 4};
      expect(bonusOf(game, PartyName.MARS, 'Mb01').getScore(player)).eq(5);

      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(bonusOf(game, PartyName.MARS, 'Mb02').getScore(player)).eq(1);
    });

    it('Scientists: science tags, cards in hand', () => {
      const [game, player] = gigaGame(PartyName.SCIENTISTS);
      player.tagsForTest = {[Tag.SCIENCE]: 3};
      player.cardsInHand.push(fakeCard(), fakeCard());
      expect(bonusOf(game, PartyName.SCIENTISTS, 'Sb01').getScore(player)).eq(3);
      expect(bonusOf(game, PartyName.SCIENTISTS, 'Sb02').getScore(player)).eq(2);
    });

    it('Unity: planet tags except Mars, space tags and titanium production', () => {
      const [game, player] = gigaGame(PartyName.UNITY);
      player.tagsForTest = {[Tag.VENUS]: 1, [Tag.EARTH]: 2, [Tag.JOVIAN]: 1, [Tag.MARS]: 5, [Tag.SPACE]: 3};
      player.production.add(Resource.TITANIUM, 2);
      expect(bonusOf(game, PartyName.UNITY, 'Ub01').getScore(player)).eq(4);
      expect(bonusOf(game, PartyName.UNITY, 'Ub02').getScore(player)).eq(5);
    });

    it('Kelvinists: heat production', () => {
      const [game, player] = gigaGame(PartyName.KELVINISTS);
      player.production.add(Resource.HEAT, 4);
      expect(bonusOf(game, PartyName.KELVINISTS, 'Kb01').getScore(player)).eq(4);
    });

    it('Greens: plant, microbe and animal tags, greeneries', () => {
      const [game, player] = gigaGame(PartyName.GREENS);
      player.tagsForTest = {[Tag.PLANT]: 2, [Tag.MICROBE]: 1, [Tag.ANIMAL]: 1};
      expect(bonusOf(game, PartyName.GREENS, 'Gb01').getScore(player)).eq(4);
      game.addGreenery(player, plainSpace(game, player));
      expect(bonusOf(game, PartyName.GREENS, 'Gb02').getScore(player)).eq(2);
    });

    it('Reds A: the lowest TR gains 1 TR', () => {
      const [game, player, player2] = gigaGame(PartyName.REDS);
      player.setTerraformRating(25);
      player2.setTerraformRating(22);
      bonusOf(game, PartyName.REDS, 'Rb01').grant(game);
      expect(player.terraformRating).eq(25);
      expect(player2.terraformRating).eq(23);
    });

    it('Reds B: the fewest tiles on Mars gains 1 TR', () => {
      const [game, player, player2] = gigaGame(PartyName.REDS);
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      const tr = player.terraformRating;
      const tr2 = player2.terraformRating;
      bonusOf(game, PartyName.REDS, 'Rb02').grant(game);
      expect(player.terraformRating).eq(tr);
      expect(player2.terraformRating).eq(tr2 + 1);
    });

    it('Bureaucrats: 2 M€ per delegate in a party, 2 M€ per influence', () => {
      const [game, player] = gigaGame(PartyName.BUREAUCRATS, PartyName.GREENS);
      const turmoil = Turmoil.getTurmoil(game);
      turmoil.sendDelegateToParty(player, PartyName.BUREAUCRATS, game);
      turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
      expect(bonusOf(game, PartyName.BUREAUCRATS, 'Bb01').getScore(player)).eq(4);

      turmoil.chairman = player;
      const influence = turmoil.getInfluence(player);
      expect(influence).is.greaterThan(0);
      expect(bonusOf(game, PartyName.BUREAUCRATS, 'Bb02').getScore(player)).eq(2 * influence);
    });

    it('Centrists: different tags, kinds of tiles', () => {
      const [game, player] = gigaGame(PartyName.CENTRISTS, PartyName.GREENS);
      player.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.POWER]}), fakeCard({tags: [Tag.SPACE]}), fakeCard({tags: [Tag.EARTH, Tag.EARTH, Tag.EARTH]}));
      expect(bonusOf(game, PartyName.CENTRISTS, 'Cb01').getScore(player)).eq(3);

      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      game.addGreenery(player, plainSpace(game, player));
      expect(bonusOf(game, PartyName.CENTRISTS, 'Cb02').getScore(player)).eq(4);

      player.megaCredits = 0;
      bonusOf(game, PartyName.CENTRISTS, 'Cb01').grantForPlayer?.(player);
      expect(player.megaCredits).eq(3);
    });

    it('Empower: energy, nuclear and tagless cards, energy production', () => {
      const [game, player] = gigaGame(PartyName.EMPOWER);
      player.playedCards.push(
        fakeCard({tags: [Tag.POWER]}), fakeCard({tags: [Tag.POWER]}), fakeCard({tags: [Tag.RADIOACTIVE]}),
        fakeCard({tags: []}), fakeCard({tags: [Tag.SPACE]}));
      expect(bonusOf(game, PartyName.EMPOWER, 'Eb01').getScore(player)).eq(4);
      player.production.add(Resource.ENERGY, 3);
      expect(bonusOf(game, PartyName.EMPOWER, 'Eb02').getScore(player)).eq(3);
    });

    it('Empower: industries are worth 2 M€ each', () => {
      const [game, player] = gigaGame(PartyName.EMPOWER);
      player.production.add(Resource.ENERGY, 1);
      for (const kind of [TileType.INDUSTRY_MONEY, TileType.INDUSTRY_STEEL]) {
        game.simpleAddTile(player, game.board.getAvailableSpacesOnLand(player)[0], {tileType: kind});
      }
      expect(bonusOf(game, PartyName.EMPOWER, 'Eb02').getScore(player)).eq(5);
    });

    it('Populists: events played', () => {
      const [game, player] = gigaGame(PartyName.POPULISTS);
      player.playedCards.push(fakeCard({type: CardType.EVENT}), fakeCard({type: CardType.EVENT}), fakeCard({type: CardType.AUTOMATED}));
      expect(bonusOf(game, PartyName.POPULISTS, 'Pb01').getScore(player)).eq(2);
    });

    it('Spome: habitats, tiles next to cities and colonies', () => {
      const [game, player] = gigaGame(PartyName.SPOME);
      const city = plainSpace(game, player);
      game.addTile(player, city, {tileType: TileType.CITY});
      const next = game.board.getAdjacentSpaces(city).find((s) => s.tile === undefined && s.spaceType === city.spaceType && s.bonus.length === 0)!;
      game.addGreenery(player, next);
      // Only the greenery is next to a city.
      expect(bonusOf(game, PartyName.SPOME, 'Ob02').getScore(player)).eq(1);
      expect(bonusOf(game, PartyName.SPOME, 'Ob01').getScore(player)).eq(0);
    });

    it('Transhumanists: wild tags, tag requirements, milestones and awards', () => {
      const [game, player] = gigaGame(PartyName.TRANSHUMANISTS);
      player.tagsForTest = {[Tag.WILD]: 2};
      player.playedCards.push(fakeCard({requirements: [{tag: Tag.SCIENCE, count: 1}]}), fakeCard({requirements: [{oxygen: 3}]}));
      expect(bonusOf(game, PartyName.TRANSHUMANISTS, 'Tb01').getScore(player)).eq(3);

      game.claimedMilestones.push({milestone: game.milestones[0], player});
      game.fundedAwards.push({award: game.awards[0], player});
      expect(bonusOf(game, PartyName.TRANSHUMANISTS, 'Tb02').getScore(player)).eq(4);
    });
  });

  describe('policies', () => {
    const tilePolicyTest = (partyName: PartyName, policyId: string, check: (game: IGame, player: TestPlayer) => void) => {
      const [game, player] = gigaGame(partyName);
      setRulingParty(game, partyName, policyId as never);
      check(game, player);
    };

    it('only applies the ruling policy of the ruling party', () => {
      const [game, player] = gigaGame(PartyName.MARS, PartyName.GREENS);
      setRulingParty(game, PartyName.GREENS, 'Gp02');
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.steel).eq(0);
      expect(player.plants).eq(1);
    });

    it('does nothing outside the action phase, or without Giga Turmoil', () => {
      const [game, player] = gigaGame(PartyName.MARS);
      setRulingParty(game, PartyName.MARS, 'Mp01');
      game.phase = Phase.PRODUCTION;
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.steel).eq(0);

      const [standard, p] = testGame(2, {turmoilExtension: true});
      standard.phase = Phase.ACTION;
      expect(GigaHooks.activePolicy(p)).is.undefined;
    });

    it('Mars First 1: 1 steel for a tile on Mars', () => tilePolicyTest(PartyName.MARS, 'Mp01', (game, player) => {
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.steel).eq(1);
    }));

    it('Mars First 2: pay 22 M€, steel can be used, to place a city', () => tilePolicyTest(PartyName.MARS, 'Mp02', (game, player) => {
      const policy = policyOf(game, PartyName.MARS, 'Mp02');
      player.megaCredits = 21;
      expect(policy.canAct!(player)).is.false;
      player.steel = 1;
      expect(policy.canAct!(player)).is.true;
      player.megaCredits = 22;
      player.steel = 0;
      expect(policy.canAct!(player)).is.true;
      // Repeatable.
      player.politicalAgendasActionUsedCount = 99;
      expect(policy.canAct!(player)).is.true;
    }));

    it('Mars First 3: 2 M€ for a building or Mars tag card', () => tilePolicyTest(PartyName.MARS, 'Mp03', (_game, player) => {
      GigaHooks.onCardPlayed(player, fakeCard({tags: [Tag.BUILDING, Tag.BUILDING]}));
      expect(player.megaCredits).eq(2);
      GigaHooks.onCardPlayed(player, fakeCard({tags: [Tag.MARS]}));
      expect(player.megaCredits).eq(4);
      GigaHooks.onCardPlayed(player, fakeCard({tags: [Tag.SPACE]}));
      expect(player.megaCredits).eq(4);
    }));

    it('Mars First 4: spend 4 M€ to buy the first card with a building or Mars tag', () => tilePolicyTest(PartyName.MARS, 'Mp04', (game, player) => {
      const policy = policyOf(game, PartyName.MARS, 'Mp04');
      player.megaCredits = 3;
      expect(policy.canAct!(player)).is.false;
      player.megaCredits = 10;
      const options = cast(policy.action!(player), OrOptions);
      expect(options.options).has.length(2);
      cast(options.options[0], SelectOption).cb(undefined);
      runAllActions(game);
      expect(player.megaCredits).eq(6);
      expect(player.politicalAgendasActionUsedCount).eq(1);
      expect(player.cardsInHand).has.length(1);
      expect(player.cardsInHand[0].tags).includes(Tag.BUILDING);
    }));

    it('Scientists 1: all players have 2 more science tags', () => tilePolicyTest(PartyName.SCIENTISTS, 'Sp01', (game, player) => {
      expect(player.tags.count(Tag.SCIENCE, 'default')).eq(2);
      expect(game.players[1].tags.count(Tag.SCIENCE, 'default')).eq(2);
      expect(player.tags.count(Tag.SCIENCE, 'raw')).eq(0);
      expect(player.tags.multipleCount([Tag.SCIENCE, Tag.SPACE])).eq(2);
    }));

    it('Scientists 2: requirements are adjustable by 2', () => tilePolicyTest(PartyName.SCIENTISTS, 'Sp02', (game, player) => {
      expect(GigaHooks.requirementBonus(player)).eq(2);
      game.phase = Phase.RESEARCH;
      expect(GigaHooks.requirementBonus(player)).eq(0);
    }));

    it('Scientists 3: draw a card and discard a card when raising a Mars parameter', () => tilePolicyTest(PartyName.SCIENTISTS, 'Sp03', (game, player) => {
      game.increaseOxygenLevel(player, 1);
      runAllActions(game);
      // The new card is the only one in hand, so it is discarded.
      expect(player.cardsInHand).is.empty;
      expect(game.projectDeck.discardPile.length).is.greaterThan(0);
    }));

    it('Scientists 3: Venus is not a Mars parameter', () => tilePolicyTest(PartyName.SCIENTISTS, 'Sp03', (game, player) => {
      const before = game.projectDeck.discardPile.length;
      game.increaseVenusScaleLevel(player, 1);
      runAllActions(game);
      expect(game.projectDeck.discardPile.length).eq(before);
    }));

    it('Scientists 4: buy the first card with a science tag or a requirement', () => tilePolicyTest(PartyName.SCIENTISTS, 'Sp04', (game, player) => {
      player.megaCredits = 10;
      const options = cast(policyOf(game, PartyName.SCIENTISTS, 'Sp04').action!(player), OrOptions);
      expect(options.options).has.length(2);
      cast(options.options[1], SelectOption).cb(undefined);
      runAllActions(game);
      expect(player.megaCredits).eq(6);
      expect(player.cardsInHand[0].requirements.length).is.greaterThan(0);
    }));

    it('Unity 1: titanium is worth 1 more', () => tilePolicyTest(PartyName.UNITY, 'Up01', (game, player) => {
      expect(player.getTitaniumValue()).eq(4);
      game.phase = Phase.RESEARCH;
      expect(player.getTitaniumValue()).eq(3);
    }));

    it('Unity 2: spend 10 M€ to gain a trade fleet, with Colonies', () => {
      const [game, player] = testGame(2, {...GIGA_OPTIONS, coloniesExtension: true});
      startWith(game, PartyName.UNITY);
      setRulingParty(game, PartyName.UNITY, 'Up02');
      const policy = policyOf(game, PartyName.UNITY, 'Up02');
      player.megaCredits = 10;
      expect(policy.canAct!(player)).is.true;
      const fleet = player.colonies.getFleetSize();
      policy.action!(player);
      runAllActions(game);
      expect(player.colonies.getFleetSize()).eq(fleet + 1);
      expect(player.megaCredits).eq(0);
      expect(player.politicalAgendasActionUsedCount).eq(1);
    });

    it('Unity 2: needs Colonies', () => tilePolicyTest(PartyName.UNITY, 'Up02', (game, player) => {
      player.megaCredits = 10;
      expect(policyOf(game, PartyName.UNITY, 'Up02').canAct!(player)).is.false;
    }));

    it('Unity 3: all players have 2 more space tags', () => tilePolicyTest(PartyName.UNITY, 'Up03', (game, player) => {
      expect(player.tags.count(Tag.SPACE, 'default')).eq(2);
      expect(game.players[1].tags.count(Tag.SPACE, 'default')).eq(2);
    }));

    it('Unity 4: choose a planet tag or the space tag', () => tilePolicyTest(PartyName.UNITY, 'Up04', (game, player) => {
      player.megaCredits = 4;
      const options = cast(policyOf(game, PartyName.UNITY, 'Up04').action!(player), OrOptions);
      const titles = options.options.map((o) => o.title.toString());
      expect(titles.some((t) => t.includes('earth'))).is.true;
      expect(titles.some((t) => t.includes('space'))).is.true;
      expect(titles.some((t) => t.includes('mars'))).is.false;
    }));

    it('Kelvinists 1: 3 M€ for each temperature step', () => tilePolicyTest(PartyName.KELVINISTS, 'Kp01', (game, player) => {
      game.increaseTemperature(player, 1);
      expect(player.megaCredits).eq(3);
      game.increaseOxygenLevel(player, 1);
      expect(player.megaCredits).eq(3);
    }));

    it('Kelvinists 2: lower heat production 2 steps to gain 1 TR', () => tilePolicyTest(PartyName.KELVINISTS, 'Kp02', (game, player) => {
      const policy = policyOf(game, PartyName.KELVINISTS, 'Kp02');
      expect(policy.canAct!(player)).is.false;
      player.production.add(Resource.HEAT, 2);
      expect(policy.canAct!(player)).is.true;
      const tr = player.terraformRating;
      policy.action!(player);
      expect(player.production.heat).eq(0);
      expect(player.terraformRating).eq(tr + 1);
      expect(policy.canAct!(player)).is.false;
    }));

    it('Kelvinists 3: pay 9 M€ to raise heat production 2 steps, repeatably', () => tilePolicyTest(PartyName.KELVINISTS, 'Kp03', (game, player) => {
      const policy = policyOf(game, PartyName.KELVINISTS, 'Kp03');
      player.megaCredits = 18;
      policy.action!(player);
      runAllActions(game);
      expect(player.production.heat).eq(2);
      expect(player.megaCredits).eq(9);
      expect(policy.canAct!(player)).is.true;
      policy.action!(player);
      runAllActions(game);
      expect(player.production.heat).eq(4);
      expect(policy.canAct!(player)).is.false;
    }));

    it('Kelvinists 4: 2 heat for a tile on Mars', () => tilePolicyTest(PartyName.KELVINISTS, 'Kp04', (game, player) => {
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.heat).eq(2);
    }));

    it('Reds 1: pay 3 M€ for each TR', () => tilePolicyTest(PartyName.REDS, 'Rp01', (_game, player) => {
      expect(PartyHooks.reds01PolicyInEffect(player)).is.true;
      expect(GigaHooks.redsPaysForTerraforming(player)).is.true;
      player.megaCredits = 2;
      expect(player.canAfford({cost: 0, tr: {tr: 1}})).is.false;
      player.megaCredits = 3;
      expect(player.canAfford({cost: 0, tr: {tr: 1}})).is.true;
    }));

    it('Reds 1: is not in effect when another policy is', () => tilePolicyTest(PartyName.REDS, 'Rp03', (_game, player) => {
      expect(PartyHooks.reds01PolicyInEffect(player)).is.false;
    }));

    it('Reds 2: discard a card for a standard project', () => tilePolicyTest(PartyName.REDS, 'Rp02', (game, player) => {
      player.megaCredits = 11;
      player.cardsInHand.push(fakeCard());
      const project = new PowerPlantStandardProject();
      project.payAndExecute(player, Payment.of({megacredits: project.getAdjustedCost(player)}));
      runAllActions(game);
      expect(player.cardsInHand).is.empty;
    }));

    it('Reds 3: pay 3 M€ for a tile on Mars', () => tilePolicyTest(PartyName.REDS, 'Rp03', (game, player) => {
      player.megaCredits = 10;
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.megaCredits).eq(7);
      player.megaCredits = 1;
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.megaCredits).eq(0);
    }));

    it('Reds 4: lose M€ production when a Mars parameter is raised', () => tilePolicyTest(PartyName.REDS, 'Rp04', (game, player) => {
      game.increaseOxygenLevel(player, 1);
      expect(player.production.megacredits).eq(-1);
      game.increaseTemperature(player, 2);
      expect(player.production.megacredits).eq(-3);
    }));

    it('Greens 1: 4 M€ for a greenery', () => tilePolicyTest(PartyName.GREENS, 'Gp01', (game, player) => {
      game.addGreenery(player, plainSpace(game, player));
      expect(player.megaCredits).eq(4);
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.megaCredits).eq(4);
    }));

    it('Greens 2: 1 plant for a tile on Mars', () => tilePolicyTest(PartyName.GREENS, 'Gp02', (game, player) => {
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      expect(player.plants).eq(1);
    }));

    it('Greens 3: a plant, or the matching resource on the card', () => tilePolicyTest(PartyName.GREENS, 'Gp03', (game, player) => {
      const microbes = fakeCard({tags: [Tag.MICROBE], resourceType: CardResource.MICROBE});
      player.playedCards.push(microbes);
      GigaHooks.onCardPlayed(player, microbes);
      runAllActions(game);
      expect(microbes.resourceCount).eq(1);
      expect(player.plants).eq(0);

      const plain = fakeCard({tags: [Tag.PLANT, Tag.ANIMAL]});
      player.playedCards.push(plain);
      GigaHooks.onCardPlayed(player, plain);
      runAllActions(game);
      // Both tags give a plant: the card holds no animals.
      expect(player.plants).eq(2);
    }));

    it('Greens 4: buy the first card with a plant or animal tag', () => tilePolicyTest(PartyName.GREENS, 'Gp04', (game, player) => {
      player.megaCredits = 4;
      const options = cast(policyOf(game, PartyName.GREENS, 'Gp04').action!(player), OrOptions);
      cast(options.options[1], SelectOption).cb(undefined);
      runAllActions(game);
      expect(player.megaCredits).eq(0);
      expect(player.cardsInHand[0].tags).includes(Tag.ANIMAL);
    }));

    it('Bureaucrats 1: at most 2 card actions plus influence', () => tilePolicyTest(PartyName.BUREAUCRATS, 'Bp01', (game, player) => {
      const turmoil = Turmoil.getTurmoil(game);
      player.playedCards.push(new Tardigrades());
      expect(player.getPlayableActionCards()).has.length(1);

      player.actionsThisGeneration.add('A' as CardName);
      expect(player.getPlayableActionCards()).has.length(1);
      player.actionsThisGeneration.add('B' as CardName);
      expect(player.getPlayableActionCards()).is.empty;

      turmoil.addInfluenceBonus(player, 1);
      expect(player.getPlayableActionCards()).has.length(1);
    }));

    it('Bureaucrats 2: pay 3 M€ minus influence at the start of a turn', () => tilePolicyTest(PartyName.BUREAUCRATS, 'Bp02', (game, player) => {
      const turmoil = Turmoil.getTurmoil(game);
      player.megaCredits = 10;
      GigaHooks.onTurnStart(player);
      expect(player.megaCredits).eq(7);

      turmoil.addInfluenceBonus(player, 2);
      GigaHooks.onTurnStart(player);
      expect(player.megaCredits).eq(6);

      turmoil.addInfluenceBonus(player, 5);
      GigaHooks.onTurnStart(player);
      expect(player.megaCredits).eq(6);
    }));

    it('Bureaucrats 2: pays what the player has', () => tilePolicyTest(PartyName.BUREAUCRATS, 'Bp02', (_game, player) => {
      player.megaCredits = 1;
      GigaHooks.onTurnStart(player);
      expect(player.megaCredits).eq(0);
    }));

    it('Bureaucrats 3: 3 M€ for placing a delegate', () => tilePolicyTest(PartyName.BUREAUCRATS, 'Bp03', (game, player) => {
      const turmoil = Turmoil.getTurmoil(game);
      turmoil.sendDelegateToParty(player, PartyName.BUREAUCRATS, game);
      expect(player.megaCredits).eq(3);
      turmoil.sendDelegateToParty('NEUTRAL', PartyName.BUREAUCRATS, game);
      expect(player.megaCredits).eq(3);
    }));

    it('Bureaucrats 4: discard a card for each card played, unless chairman', () => tilePolicyTest(PartyName.BUREAUCRATS, 'Bp04', (game, player) => {
      const turmoil = Turmoil.getTurmoil(game);
      player.cardsInHand.push(fakeCard());
      GigaHooks.onCardPlayed(player, fakeCard());
      runAllActions(game);
      expect(player.cardsInHand).is.empty;

      turmoil.chairman = player;
      player.cardsInHand.push(fakeCard());
      GigaHooks.onCardPlayed(player, fakeCard());
      runAllActions(game);
      expect(player.cardsInHand).has.length(1);
    }));

    it('Centrists 1: pay one of each standard resource for 15 M€', () => tilePolicyTest(PartyName.CENTRISTS, 'Cp01', (game, player) => {
      const policy = policyOf(game, PartyName.CENTRISTS, 'Cp01');
      player.stock.override({steel: 1, titanium: 1, plants: 1, energy: 1, heat: 0});
      expect(policy.canAct!(player)).is.false;
      player.heat = 3;
      expect(policy.canAct!(player)).is.true;

      policy.action!(player);

      expect(player.stock.asUnits()).deep.eq({megacredits: 15, steel: 0, titanium: 0, plants: 0, energy: 0, heat: 2});
      expect(policy.canAct!(player)).is.false;
    }));

    it('Centrists 2: pay 7 M€ to raise one of the lowest productions', () => tilePolicyTest(PartyName.CENTRISTS, 'Cp02', (game, player) => {
      const policy = policyOf(game, PartyName.CENTRISTS, 'Cp02');
      player.production.override({megacredits: 2, steel: 1, titanium: 1, plants: 3, energy: 4, heat: 5});
      player.megaCredits = 7;
      policy.action!(player);
      runAllActions(game);
      // The lowest are steel and titanium.
      const options = cast(player.popWaitingFor(), OrOptions);
      expect(options.options).has.length(2);
      cast(options.options[1], SelectOption).cb(undefined);
      expect(player.production.titanium).eq(2);
      expect(player.production.steel).eq(1);
      expect(player.megaCredits).eq(0);
    }));

    it('Centrists 2: a single lowest production is raised right away', () => tilePolicyTest(PartyName.CENTRISTS, 'Cp02', (game, player) => {
      player.production.override({megacredits: 2, steel: 1, titanium: 0, plants: 3, energy: 4, heat: 5});
      player.megaCredits = 7;
      policyOf(game, PartyName.CENTRISTS, 'Cp02').action!(player);
      runAllActions(game);
      expect(player.production.titanium).eq(1);
    }));

    it('Centrists 3: 4 M€ for a card with a tag you did not have', () => tilePolicyTest(PartyName.CENTRISTS, 'Cp03', (_game, player) => {
      const first = fakeCard({tags: [Tag.SPACE, Tag.SPACE]});
      player.playedCards.push(first);
      GigaHooks.onCardPlayed(player, first);
      expect(player.megaCredits).eq(4);

      const second = fakeCard({tags: [Tag.SPACE]});
      player.playedCards.push(second);
      GigaHooks.onCardPlayed(player, second);
      expect(player.megaCredits).eq(4);

      const third = fakeCard({tags: [Tag.SPACE, Tag.EARTH]});
      player.playedCards.push(third);
      GigaHooks.onCardPlayed(player, third);
      expect(player.megaCredits).eq(8);
    }));

    it('Centrists 4: buy the first card with a tag you do not have', () => tilePolicyTest(PartyName.CENTRISTS, 'Cp04', (game, player) => {
      player.megaCredits = 4;
      player.tagsForTest = {[Tag.BUILDING]: 1};
      policyOf(game, PartyName.CENTRISTS, 'Cp04').action!(player);
      runAllActions(game);
      expect(player.megaCredits).eq(0);
      expect(player.cardsInHand).has.length(1);
      const card: IProjectCard = player.cardsInHand[0];
      expect(card.tags.some((t) => t !== Tag.BUILDING && t !== Tag.EVENT && t !== Tag.WILD && t !== Tag.CLONE)).is.true;
    }));

    it('Empower 1: energy is worth 2 M€', () => tilePolicyTest(PartyName.EMPOWER, 'Ep01', (game, player) => {
      player.megaCredits = 1;
      player.energy = 3;
      expect(player.canUseEnergyAsMegaCredits).is.true;
      expect(player.energyValue).eq(2);
      expect(player.spendableMegacredits()).eq(7);
      expect(player.payingAmount(Payment.of({megacredits: 1, energy: 2}))).eq(5);
      expect(player.canAfford(7)).is.true;
      expect(player.canAfford(8)).is.false;
      game.phase = Phase.RESEARCH;
      expect(player.canUseEnergyAsMegaCredits).is.false;
      expect(player.energyValue).eq(1);
    }));

    it('Empower 2: 2 energy whenever energy production changes', () => tilePolicyTest(PartyName.EMPOWER, 'Ep02', (_game, player) => {
      player.production.add(Resource.ENERGY, 1);
      expect(player.energy).eq(2);
      player.production.add(Resource.ENERGY, -1);
      expect(player.energy).eq(4);
      player.production.add(Resource.HEAT, 1);
      expect(player.energy).eq(4);
      // Nothing changes when there is nothing to lower.
      player.production.add(Resource.ENERGY, -1);
      expect(player.energy).eq(4);
    }));

    it('Empower 3: 2 more energy tags', () => tilePolicyTest(PartyName.EMPOWER, 'Ep03', (_game, player) => {
      expect(player.tags.count(Tag.POWER, 'default')).eq(2);
    }));

    it('Empower 4: buy the first card with an energy or nuclear tag', () => tilePolicyTest(PartyName.EMPOWER, 'Ep04', (game, player) => {
      player.megaCredits = 4;
      const options = cast(policyOf(game, PartyName.EMPOWER, 'Ep04').action!(player), OrOptions);
      expect(options.options).has.length(2);
      cast(options.options[0], SelectOption).cb(undefined);
      runAllActions(game);
      expect(player.cardsInHand[0].tags).includes(Tag.POWER);
    }));

    it('Populists 1: gain or pay twice the VP of a card', () => tilePolicyTest(PartyName.POPULISTS, 'Pp01', (_game, player) => {
      GigaHooks.onCardPlayed(player, fakeCard({victoryPoints: 2}));
      expect(player.megaCredits).eq(4);
      GigaHooks.onCardPlayed(player, fakeCard({victoryPoints: -1}));
      expect(player.megaCredits).eq(2);
      GigaHooks.onCardPlayed(player, fakeCard({victoryPoints: -5}));
      expect(player.megaCredits).eq(0);
      GigaHooks.onCardPlayed(player, fakeCard({}));
      expect(player.megaCredits).eq(0);
    }));

    it('Populists: policy 2 is not available yet', () => {
      const [game] = gigaGame(PartyName.POPULISTS);
      const ids = Turmoil.getTurmoil(game).getPartyByName(PartyName.POPULISTS).policies.map((p) => p.id);
      expect(ids).deep.eq(['Pp01', 'Pp03', 'Pp04']);
    });

    it('Populists 3: draw a card for an event', () => tilePolicyTest(PartyName.POPULISTS, 'Pp03', (game, player) => {
      GigaHooks.onCardPlayed(player, fakeCard({type: CardType.EVENT}));
      runAllActions(game);
      expect(player.cardsInHand).has.length(1);
      GigaHooks.onCardPlayed(player, fakeCard({type: CardType.AUTOMATED}));
      runAllActions(game);
      expect(player.cardsInHand).has.length(1);
    }));

    it('Populists 4: buy the first event card', () => tilePolicyTest(PartyName.POPULISTS, 'Pp04', (game, player) => {
      player.megaCredits = 4;
      policyOf(game, PartyName.POPULISTS, 'Pp04').action!(player);
      runAllActions(game);
      expect(player.megaCredits).eq(0);
      expect(player.cardsInHand[0].type).eq(CardType.EVENT);
    }));

    it('Spome 1: draw a card for a city', () => tilePolicyTest(PartyName.SPOME, 'Op01', (game, player) => {
      game.addTile(player, plainSpace(game, player), {tileType: TileType.CITY});
      runAllActions(game);
      expect(player.cardsInHand).has.length(1);
      game.addGreenery(player, plainSpace(game, player));
      runAllActions(game);
      expect(player.cardsInHand).has.length(1);
    }));

    it('Spome 2: 4 M€ for a lunar habitat or Venus habitat', () => tilePolicyTest(PartyName.SPOME, 'Op02', (_game, player) => {
      GigaHooks.onTilePlaced(player, {id: 'm01', tile: {tileType: TileType.MOON_HABITAT}} as Space);
      expect(player.megaCredits).eq(4);
      GigaHooks.onTilePlaced(player, {id: 'v01', tile: {tileType: TileType.VENUS_HABITAT}} as Space);
      expect(player.megaCredits).eq(8);
      GigaHooks.onTilePlaced(player, {id: '01', tile: {tileType: TileType.CITY}} as Space);
      expect(player.megaCredits).eq(8);
    }));

    it('Spome 3: needs Colonies', () => tilePolicyTest(PartyName.SPOME, 'Op03', (game, player) => {
      player.megaCredits = 15;
      expect(policyOf(game, PartyName.SPOME, 'Op03').canAct!(player)).is.false;
    }));

    it('Transhumanists 1: one more wild tag', () => tilePolicyTest(PartyName.TRANSHUMANISTS, 'Tp01', (_game, player) => {
      expect(player.tags.count(Tag.WILD, 'default')).eq(1);
      expect(player.tags.count(Tag.EARTH, 'default')).eq(1);
      expect(player.tags.multipleCount([Tag.EARTH, Tag.SPACE])).eq(1);
      expect(player.tags.count(Tag.EARTH, 'raw')).eq(0);
    }));

    it('Transhumanists 2: 2 M€ for a standard project', () => tilePolicyTest(PartyName.TRANSHUMANISTS, 'Tp02', (game, player) => {
      player.megaCredits = 11;
      const project = new PowerPlantStandardProject();
      project.payAndExecute(player, Payment.of({megacredits: project.getAdjustedCost(player)}));
      runAllActions(game);
      // 11 - 11 + 2
      expect(player.megaCredits).eq(2);
      expect(player.production.energy).eq(1);
    }));
  });
});
