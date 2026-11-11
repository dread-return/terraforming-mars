import {expect} from 'chai';
import {GIGA_PARTIES, GIGA_PARTIES_IN_PLAY, OFFICIAL_PARTIES, PartyName} from '../../src/common/turmoil/PartyName';
import {Game} from '../../src/server/Game';
import {IGame} from '../../src/server/IGame';
import {Turmoil, ALL_PARTIES} from '../../src/server/turmoil/Turmoil';
import {PoliticalAgendas} from '../../src/server/turmoil/PoliticalAgendas';
import {AndOptions} from '../../src/server/inputs/AndOptions';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {fakeCard, runAllActions, setRulingParty} from '../TestingUtils';
import {cast} from '@/common/utils/utils';
import {Payment} from '../../src/common/inputs/Payment';
import {Phase} from '../../src/common/Phase';
import {BONUS_IDS, POLICY_IDS} from '../../src/common/turmoil/Types';
import {chairmanWheelInput, availableWheelRewards, OUTER_RING_GENERATION} from '../../src/server/turmoil/ChairmanWheel';
import {Tag} from '../../src/common/cards/Tag';
import {CardResource} from '../../src/common/CardResource';
import {PowerPlantStandardProject} from '../../src/server/cards/base/standardProjects/PowerPlantStandardProject';
import {SendDelegateToArea} from '../../src/server/deferredActions/SendDelegateToArea';
import {Resource} from '../../src/common/Resource';

function gigaGame(): [IGame, TestPlayer, TestPlayer] {
  const [game, player, player2] = testGame(2, {turmoilExtension: true, gigaTurmoil: true, politicalAgendasExtension: 'Chairman'});
  game.phase = Phase.ACTION;
  return [game, player, player2];
}

/** Puts exactly these parties in play. Only for tests that need a specific party. */
function withParties(game: IGame, ...names: Array<PartyName>): Turmoil {
  const turmoil = Turmoil.getTurmoil(game);
  const rest = [...OFFICIAL_PARTIES, ...GIGA_PARTIES].filter((n) => !names.includes(n));
  turmoil.setPartiesInPlay([...names, ...rest].slice(0, GIGA_PARTIES_IN_PLAY));
  turmoil.parties.forEach((party) => {
    turmoil.politicalAgendasData.agendas.set(party.name, {bonusId: party.bonuses[0].id, policyId: party.policies[0].id});
  });
  return turmoil;
}

describe('Giga Turmoil', () => {
  describe('party catalogue', () => {
    it('every party has at least one bonus and one policy, with known ids', () => {
      for (const name of Object.values(PartyName)) {
        const party = new ALL_PARTIES[name]();
        expect(party.bonuses.length, name).is.greaterThan(0);
        expect(party.policies.length, name).is.greaterThan(0);
        for (const bonus of party.bonuses) {
          expect(BONUS_IDS, `${name} ${bonus.id}`).includes(bonus.id);
        }
        for (const policy of party.policies) {
          expect(POLICY_IDS, `${name} ${policy.id}`).includes(policy.id);
        }
      }
    });

    it('the first bonus and policy of each party are the defaults, with the first ids of that party', () => {
      for (const name of GIGA_PARTIES) {
        const party = new ALL_PARTIES[name]();
        expect(party.bonuses[0].id.endsWith('b01'), name).is.true;
        expect(party.policies[0].id.endsWith('p01'), name).is.true;
      }
    });
  });

  describe('setup', () => {
    it('a standard Turmoil game has the six official parties', () => {
      const [game] = testGame(2, {turmoilExtension: true});
      const turmoil = Turmoil.getTurmoil(game);
      expect(turmoil.gigaTurmoil).is.false;
      expect(turmoil.parties.map((p) => p.name)).deep.eq([...OFFICIAL_PARTIES]);
    });

    it('drafts six of the twelve parties, in board order', () => {
      for (let i = 0; i < 20; i++) {
        const [game] = gigaGame();
        const turmoil = Turmoil.getTurmoil(game);
        expect(turmoil.gigaTurmoil).is.true;
        const names = turmoil.parties.map((p) => p.name);
        expect(names).has.length(GIGA_PARTIES_IN_PLAY);
        expect(new Set(names).size).eq(GIGA_PARTIES_IN_PLAY);
        const order = [...OFFICIAL_PARTIES, ...GIGA_PARTIES];
        expect(names).deep.eq(order.filter((n) => names.includes(n)));
      }
    });

    it('starts with a party that is in play, and the neutral chairman', () => {
      for (let i = 0; i < 20; i++) {
        const [game] = gigaGame();
        const turmoil = Turmoil.getTurmoil(game);
        expect(turmoil.parties).includes(turmoil.rulingParty);
        expect(turmoil.parties).includes(turmoil.dominantParty);
        expect(turmoil.chairman).eq('NEUTRAL');
        const agenda = PoliticalAgendas.currentAgenda(turmoil);
        expect(agenda.bonusId).eq(turmoil.rulingParty.bonuses[0].id);
        expect(agenda.policyId).eq(turmoil.rulingParty.policies[0].id);
      }
    });

    it('parties that are not in play can be looked up, but do not get delegates', () => {
      const [game] = gigaGame();
      const turmoil = withParties(game, PartyName.GREENS);
      const absent = [...OFFICIAL_PARTIES, ...GIGA_PARTIES].find((n) => !turmoil.isInPlay(n))!;
      expect(turmoil.getPartyByName(absent).name).eq(absent);
      const reserve = turmoil.delegateReserve.get('NEUTRAL');

      turmoil.sendDelegateToParty('NEUTRAL', absent, game);

      expect(turmoil.getPartyByName(absent).delegates.size).eq(0);
      expect(turmoil.delegateReserve.get('NEUTRAL')).eq(reserve);
    });

    it('serializes and deserializes the parties in play', () => {
      const [game] = gigaGame();
      const turmoil = withParties(game, PartyName.SPOME, PartyName.EMPOWER, PartyName.GREENS);
      const names = turmoil.parties.map((p) => p.name);

      const copy = Game.deserialize(game.serialize());
      const copyTurmoil = Turmoil.getTurmoil(copy);

      expect(copyTurmoil.gigaTurmoil).is.true;
      expect(copyTurmoil.parties.map((p) => p.name)).deep.eq(names);
      expect(copyTurmoil.isInPlay(PartyName.SPOME)).is.true;
    });
  });

  describe('agendas', () => {
    it('a human chairman picks a bonus and a policy together', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.CENTRISTS, PartyName.GREENS);
      turmoil.rulingParty = turmoil.getPartyByName(PartyName.CENTRISTS);
      turmoil.chairman = player;

      PoliticalAgendas.setNextAgenda(turmoil, game);
      const andOptions = cast(game.deferredActions.pop()!.execute(), AndOptions);
      const bonuses = cast(andOptions.options[0], OrOptions);
      const policies = cast(andOptions.options[1], OrOptions);
      expect(bonuses.options).has.length(2);
      expect(policies.options.length).is.greaterThan(0);

      // Give the players tags so that the second bonus (1 M€ per different tag) pays out something.
      player.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.SPACE]}));
      player.megaCredits = 0;
      const logsBefore = game.gameLog.length;

      // Choose the second bonus. It is only applied once both are chosen.
      cast(bonuses.options[1], SelectOption).cb();
      cast(policies.options[0], SelectOption).cb();
      expect(game.gameLog.length).eq(logsBefore);
      andOptions.cb(undefined);

      expect(PoliticalAgendas.currentAgenda(turmoil)).deep.eq({bonusId: 'cb02', policyId: 'cp01'});
      expect(game.gameLog.length).is.greaterThan(logsBefore);
    });

    it('a neutral chairman gives the default bonus and policy', () => {
      const [game] = gigaGame();
      const turmoil = withParties(game, PartyName.CENTRISTS, PartyName.GREENS);
      turmoil.rulingParty = turmoil.getPartyByName(PartyName.CENTRISTS);
      turmoil.politicalAgendasData.agendas.set(PartyName.CENTRISTS, {bonusId: 'cb02', policyId: 'cp01'});
      turmoil.chairman = 'NEUTRAL';

      PoliticalAgendas.setNextAgenda(turmoil, game);

      expect(PoliticalAgendas.currentAgenda(turmoil)).deep.eq({bonusId: 'cb01', policyId: 'cp01'});
    });
  });

  describe('chairman wheel', () => {
    it('inner ring only before the outer ring opens', () => {
      const [game, player] = gigaGame();
      const early = availableWheelRewards(player, OUTER_RING_GENERATION - 1).map((r) => r.description);
      const late = availableWheelRewards(player, OUTER_RING_GENERATION).map((r) => r.description);
      expect(late.length).is.greaterThan(early.length);
      expect(early).includes('Raise your terraform rating 1 step');
      expect(early).not.includes('Raise your terraform rating 2 steps');
      expect(late).includes('Raise your terraform rating 2 steps');
      expect(game).is.not.undefined;
    });

    it('the Mars track is only offered with Pathfinders', () => {
      const [, player] = gigaGame();
      const rewards = availableWheelRewards(player, 1).map((r) => r.description);
      expect(rewards.some((d) => d.includes('Mars track'))).is.false;
    });

    it('a new human chairman gets to pick, and gets the reward', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.GREENS);
      turmoil.chairman = 'NEUTRAL';
      player.megaCredits = 0;
      const tr = player.terraformRating;

      turmoil.setNewChairman(player, game, /* setAgenda= */ false);
      // First the wheel, with the flat +1 TR as one of the choices (and not given automatically)
      const wheel = cast(game.deferredActions.pop()!.execute(), OrOptions);
      expect(player.terraformRating).eq(tr);
      const eightMC = wheel.options.find((o) => o.title.toString().includes('8 M€'))!;
      cast(eightMC, SelectOption).cb();

      expect(player.megaCredits).eq(8);
      expect(player.terraformRating).eq(tr);
    });

    it('rewards: terraform rating, production, cards', () => {
      const [game, player] = gigaGame();
      game.generation = OUTER_RING_GENERATION;
      const choose = (text: string) => {
        const wheel = cast(chairmanWheelInput(player), OrOptions);
        cast(wheel.options.find((o) => o.title.toString() === text)!, SelectOption).cb();
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
      expect(game.turmoil).is.not.undefined;
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
    const bonusScore = (partyName: PartyName, bonusId: string, player: TestPlayer) => {
      const turmoil = Turmoil.getTurmoil(player.game);
      const bonus = turmoil.getPartyByName(partyName).bonuses.find((b) => b.id === bonusId)!;
      return bonus.getScore(player);
    };

    it('Bureaucrats bb02: 2 M€ per delegate in the parties', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.BUREAUCRATS, PartyName.GREENS);
      turmoil.sendDelegateToParty(player, PartyName.BUREAUCRATS, game);
      turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
      expect(bonusScore(PartyName.BUREAUCRATS, 'bb02', player)).eq(4);
    });

    it('Empower eb01: power, radioactive and wild tags', () => {
      const [game, player] = gigaGame();
      withParties(game, PartyName.EMPOWER, PartyName.GREENS);
      player.tagsForTest = {[Tag.POWER]: 2, [Tag.RADIOACTIVE]: 1, [Tag.WILD]: 1, [Tag.SPACE]: 4};
      expect(bonusScore(PartyName.EMPOWER, 'eb01', player)).eq(4);
    });

    it('Empower eb02: energy production', () => {
      const [game, player] = gigaGame();
      withParties(game, PartyName.EMPOWER, PartyName.GREENS);
      player.production.add(Resource.ENERGY, 3);
      expect(bonusScore(PartyName.EMPOWER, 'eb02', player)).eq(3);
    });

    it('Populists pb01: lose 1 M€ per 10 M€', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.POPULISTS, PartyName.GREENS);
      player.megaCredits = 37;
      expect(bonusScore(PartyName.POPULISTS, 'pb01', player)).eq(-3);
      turmoil.getPartyByName(PartyName.POPULISTS).bonuses[0].grantForPlayer?.(player);
      expect(player.megaCredits).eq(34);
    });

    it('Centrists cb01 and cb02', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.CENTRISTS, PartyName.GREENS);
      player.playedCards.push(fakeCard({tags: [Tag.POWER, Tag.POWER]}), fakeCard({tags: [Tag.SPACE]}), fakeCard({tags: [Tag.EARTH, Tag.EARTH, Tag.EARTH]}));
      expect(bonusScore(PartyName.CENTRISTS, 'cb01', player)).eq(3);
      expect(bonusScore(PartyName.CENTRISTS, 'cb02', player)).eq(3);
      player.megaCredits = 0;
      turmoil.getPartyByName(PartyName.CENTRISTS).bonuses[0].grantForPlayer?.(player);
      expect(player.megaCredits).eq(3);
    });

    it('placeholder bonuses do nothing', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.TRANSHUMANISTS, PartyName.GREENS);
      player.megaCredits = 5;
      const bonus = turmoil.getPartyByName(PartyName.TRANSHUMANISTS).bonuses[0];
      expect(bonus.getScore(player)).eq(0);
      bonus.grantForPlayer?.(player);
      expect(player.megaCredits).eq(5);
    });
  });

  describe('policies', () => {
    it('Spome op01: 1 M€ per floater added', () => {
      const [game, player] = gigaGame();
      withParties(game, PartyName.SPOME, PartyName.GREENS);
      setRulingParty(game, PartyName.SPOME, 'op01');
      const floaterCard = fakeCard({resourceType: CardResource.FLOATER});
      const microbeCard = fakeCard({resourceType: CardResource.MICROBE});
      player.playedCards.push(floaterCard, microbeCard);
      player.megaCredits = 0;

      player.addResourceTo(floaterCard, 3);
      expect(player.megaCredits).eq(3);

      player.addResourceTo(microbeCard, 3);
      expect(player.megaCredits).eq(3);
    });

    it('Spome op01: nothing when Spome is not ruling', () => {
      const [game, player] = gigaGame();
      withParties(game, PartyName.SPOME, PartyName.GREENS);
      setRulingParty(game, PartyName.GREENS);
      const floaterCard = fakeCard({resourceType: CardResource.FLOATER});
      player.playedCards.push(floaterCard);
      player.addResourceTo(floaterCard, 3);
      expect(player.megaCredits).eq(0);
    });

    it('Bureaucrats bp01: passing sends a delegate', () => {
      const [game, player] = gigaGame();
      const turmoil = withParties(game, PartyName.BUREAUCRATS, PartyName.GREENS);
      setRulingParty(game, PartyName.BUREAUCRATS, 'bp01');
      turmoil.delegateReserve.add(player, 3);

      player.pass();

      const queued = game.deferredActions.pop();
      expect(queued).instanceOf(SendDelegateToArea);
    });

    it('Transhumanists tp02: 2 M€ for a standard project', () => {
      const [game, player] = gigaGame();
      withParties(game, PartyName.TRANSHUMANISTS, PartyName.GREENS);
      setRulingParty(game, PartyName.TRANSHUMANISTS, 'tp02');
      player.megaCredits = 11;

      const project = new PowerPlantStandardProject();
      project.payAndExecute(player, Payment.of({megacredits: project.getAdjustedCost(player)}));
      runAllActions(game);

      // 11 - 11 + 2
      expect(player.megaCredits).eq(2);
      expect(player.production.energy).eq(1);
    });
  });
});
