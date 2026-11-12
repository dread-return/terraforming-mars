import {expect} from 'chai';
import {testGame} from '../TestGame';
import {cast} from '../../src/common/utils/utils';
import {addCity, addOcean, runAllActions} from '../TestingUtils';
import {IGame} from '../../src/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {Tag} from '../../src/common/cards/Tag';
import {Phase} from '../../src/common/Phase';
import {IProjectCard} from '../../src/server/cards/IProjectCard';
import {IndividualTracks} from '../../src/server/individualTracks/IndividualTracks';
import {INDIVIDUAL_TRACKS} from '../../src/common/individualTracks/IndividualTracks';
import {ImmigrantCity} from '../../src/server/cards/base/ImmigrantCity';
import {SelectSpace} from '../../src/server/inputs/SelectSpace';
import {Player} from '../../src/server/Player';
import {calculateVictoryPoints} from '../../src/server/game/calculateVictoryPoints';
import {Banker} from '../../src/server/awards/Banker';
import {IMilestone} from '../../src/server/milestones/IMilestone';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {DomesWilderness} from '../../src/server/domesWilderness/DomesWilderness';
import {Scientist} from '../../src/server/awards/Scientist';
import {Thermalist} from '../../src/server/awards/Thermalist';
import {Landlord} from '../../src/server/awards/Landlord';

function positions(player: TestPlayer) {
  return player.individualTracksData!.positions;
}

describe('IndividualTracks', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {individualTracks: true});
  });

  it('gives players a marker at the start of every track', () => {
    expect(positions(player)).deep.eq({oxygen: 0, temperature: 0, oceans: 0, cities: 0});
    expect(player.individualTracksData!.extraClaims).eq(0);
  });

  it('does nothing when the option is off', () => {
    const [offGame, offPlayer] = testGame(2);
    offGame.increaseOxygenLevel(offPlayer, 1);
    expect(offPlayer.individualTracksData).is.undefined;
  });

  it('has the track lengths from the rulebook', () => {
    expect(INDIVIDUAL_TRACKS.oxygen.length).eq(13);
    expect(INDIVIDUAL_TRACKS.temperature.length).eq(15);
    expect(INDIVIDUAL_TRACKS.oceans.length).eq(12);
    expect(INDIVIDUAL_TRACKS.cities.length).eq(12);
  });

  describe('oxygen', () => {
    it('moves one step for every step raised, by whoever raises it', () => {
      game.increaseOxygenLevel(player, 2);
      game.increaseOxygenLevel(player2, 1);
      expect(positions(player).oxygen).eq(2);
      expect(positions(player2).oxygen).eq(1);
    });

    it('gives plant production at step 7', () => {
      game.increaseOxygenLevel(player, 2);
      game.increaseOxygenLevel(player, 2);
      game.increaseOxygenLevel(player, 2);
      expect(positions(player).oxygen).eq(6);
      expect(player.production.plants).eq(0);
      game.increaseOxygenLevel(player, 1);
      expect(player.production.plants).eq(1);
    });

    it('gives the reward of a spot passed in a multi-step move', () => {
      positions(player).oxygen = 6;
      game.increaseOxygenLevel(player, 2);
      expect(positions(player).oxygen).eq(8);
      expect(player.production.plants).eq(1);
    });

    it('gives each reward once', () => {
      positions(player).oxygen = 7;
      game.increaseOxygenLevel(player, 1);
      expect(player.production.plants).eq(0);
    });

    it('stops at the end of the track', () => {
      positions(player).oxygen = 12;
      game.increaseOxygenLevel(player, 2);
      game.increaseOxygenLevel(player, 2);
      expect(positions(player).oxygen).eq(13);
    });

    it('does not move for steps the World Government takes', () => {
      game.phase = Phase.SOLAR;
      game.increaseOxygenLevel(player, 1);
      expect(positions(player).oxygen).eq(0);
    });

    it('does not move once oxygen is maxed out', () => {
      game.increaseOxygenLevel(player, 2);
      (game as any).oxygenLevel = game.max.oxygen;
      game.increaseOxygenLevel(player, 1);
      expect(positions(player).oxygen).eq(2);
    });
  });

  describe('temperature', () => {
    it('moves one step for every step raised', () => {
      game.increaseTemperature(player, 3);
      expect(positions(player).temperature).eq(3);
    });

    it('gives heat production at steps 6 and 10', () => {
      positions(player).temperature = 5;
      game.increaseTemperature(player, 1);
      expect(player.production.heat).eq(1);
      positions(player).temperature = 9;
      game.increaseTemperature(player, 1);
      expect(player.production.heat).eq(2);
    });
  });

  describe('oceans', () => {
    it('moves when the player places an ocean', () => {
      addOcean(player);
      expect(positions(player).oceans).eq(1);
      expect(positions(player2).oceans).eq(0);
    });

    it('lets the player place an ocean at step 7', () => {
      positions(player).oceans = 6;
      addOcean(player);
      expect(positions(player).oceans).eq(7);
      runAllActions(game);
      const select = cast(player.popWaitingFor(), SelectSpace);
      select.cb(select.spaces[0]);
      runAllActions(game);
      expect(positions(player).oceans).eq(8);
      expect(game.board.getOceanSpaces()).has.length(2);
    });
  });

  describe('cities', () => {
    it('moves when the player places a city', () => {
      addCity(player);
      expect(positions(player).cities).eq(1);
    });

    it('gives steel production at step 7', () => {
      positions(player).cities = 6;
      addCity(player);
      expect(player.production.steel).eq(1);
    });

    it('moves once for a card with a city tag that places a city', () => {
      player.production.override({energy: 1, megacredits: 2});
      player.playCard(new ImmigrantCity());
      runAllActions(game);
      cast(player.popWaitingFor(), SelectSpace).cb(game.board.getAvailableSpacesForCity(player)[0]);
      runAllActions(game);
      expect(positions(player).cities).eq(1);
    });

    it('moves for a card with a city tag that places no city', () => {
      const card = {tags: [Tag.CITY]} as IProjectCard;
      IndividualTracks.beforeCardPlayed(player, card);
      expect(positions(player).cities).eq(1);
    });

    it('moves again for a city placed after the card has finished', () => {
      const card = {tags: [Tag.CITY]} as IProjectCard;
      IndividualTracks.beforeCardPlayed(player, card);
      runAllActions(game);
      addCity(player);
      expect(positions(player).cities).eq(2);
    });

    it('does not move for a card without a city tag', () => {
      const card = {tags: [Tag.BUILDING]} as IProjectCard;
      IndividualTracks.beforeCardPlayed(player, card);
      expect(positions(player).cities).eq(0);
    });

    it('moves when a dome goes on a city', () => {
      [game, player] = testGame(2, {individualTracks: true, domesWilderness: true});
      const space = addCity(player);
      expect(positions(player).cities).eq(1);
      DomesWilderness.upgrade(player, space, 'dome');
      expect(positions(player).cities).eq(2);
    });
  });

  describe('milestone and award spot', () => {
    it('gives an extra claim', () => {
      positions(player).oxygen = 10;
      game.increaseOxygenLevel(player, 1);
      expect(player.individualTracksData!.extraClaims).eq(1);
    });

    it('is at step 13 for temperature, 10 for oceans and 11 for cities', () => {
      positions(player).temperature = 12;
      game.increaseTemperature(player, 1);
      positions(player).oceans = 9;
      addOcean(player);
      positions(player).cities = 10;
      addCity(player);
      expect(player.individualTracksData!.extraClaims).eq(3);
    });

    /** A milestone any player can claim, so the tests are about the limit only. */
    function easyMilestone(name: string): IMilestone {
      return {name, description: '', canClaim: () => true, getScore: () => 0} as unknown as IMilestone;
    }

    function claimThreeMilestones() {
      const three = [easyMilestone('A'), easyMilestone('B'), easyMilestone('C')];
      const fourth = easyMilestone('D');
      game.milestones.push(...three, fourth);
      game.claimedMilestones.push(...three.map((milestone) => ({player: player2, milestone})));
      return fourth;
    }

    function claimOption(): OrOptions | undefined {
      return player.getActions().options.find((o) => o.title === 'Claim a milestone') as OrOptions | undefined;
    }

    it('lets a player claim a fourth milestone', () => {
      claimThreeMilestones();
      player.megaCredits = 100;
      expect(player.claimableMilestones()).is.empty;
      expect(claimOption()).is.undefined;
      player.individualTracksData!.extraClaims = 1;
      expect(player.claimableMilestones()).has.length(1);
      expect(claimOption()).is.not.undefined;
    });

    it('is used up by claiming past the limit', () => {
      const fourth = claimThreeMilestones();
      player.individualTracksData!.extraClaims = 1;
      player.megaCredits = 100;
      cast(claimOption()!.options.find((o) => o.title === fourth.name), SelectOption).cb();
      runAllActions(game);
      expect(game.claimedMilestones).has.length(4);
      expect(player.individualTracksData!.extraClaims).eq(0);
    });

    it('is kept when the player claims within the limit', () => {
      game.milestones.push(easyMilestone('A'));
      player.individualTracksData!.extraClaims = 1;
      player.megaCredits = 100;
      cast(claimOption()!.options[0], SelectOption).cb();
      runAllActions(game);
      expect(game.claimedMilestones).has.length(1);
      expect(player.individualTracksData!.extraClaims).eq(1);
    });

    it('lets a player fund a fourth award', () => {
      game.fundedAwards.push(
        {player: player2, award: new Banker()},
        {player: player2, award: new Scientist()},
        {player: player2, award: new Thermalist()});
      player.megaCredits = 100;
      expect(game.allAwardsFunded()).is.true;
      expect(() => game.fundAward(player, new Landlord())).to.throw(/All awards already funded/);
      player.individualTracksData!.extraClaims = 1;
      game.fundAward(player, new Landlord());
      expect(game.fundedAwards).has.length(4);
      expect(player.individualTracksData!.extraClaims).eq(0);
    });
  });

  describe('leaders', () => {
    it('is nobody while no one has moved', () => {
      expect(IndividualTracks.leaders(game, 'oxygen')).is.empty;
    });

    it('is the player furthest along, and every player on a tie', () => {
      positions(player).oxygen = 3;
      positions(player2).oxygen = 2;
      expect(IndividualTracks.leaders(game, 'oxygen')).deep.eq([player]);
      positions(player2).oxygen = 3;
      expect(IndividualTracks.leaders(game, 'oxygen')).deep.eq([player, player2]);
    });

    it('gets the resource of each track in the production phase', () => {
      positions(player).oxygen = 1;
      positions(player2).oxygen = 1;
      positions(player).temperature = 2;
      positions(player2).oceans = 1;
      positions(player2).cities = 4;
      positions(player).cities = 3;
      IndividualTracks.grantLeaderRewards(game);
      expect(player.stock.asUnits()).deep.eq({megacredits: 0, steel: 0, titanium: 0, plants: 1, energy: 0, heat: 1});
      expect(player2.stock.asUnits()).deep.eq({megacredits: 2, steel: 1, titanium: 0, plants: 1, energy: 0, heat: 0});
    });

    it('gives nothing when the option is off', () => {
      const [offGame, offPlayer] = testGame(2);
      IndividualTracks.grantLeaderRewards(offGame);
      expect(offPlayer.stock.asUnits().plants).eq(0);
    });

    it('gives 3 VP to the leader of each track, shared on a tie', () => {
      const base = calculateVictoryPoints(player).total;
      positions(player).oxygen = 3;
      positions(player2).oxygen = 3;
      positions(player).cities = 1;
      expect(calculateVictoryPoints(player).total).eq(base + 6);
      expect(calculateVictoryPoints(player2).total).eq(calculateVictoryPoints(player2).total);
      expect(calculateVictoryPoints(player2).victoryPoints).eq(3);
    });
  });

  it('is saved and restored with the game', () => {
    positions(player).oxygen = 5;
    positions(player).cities = 2;
    player.individualTracksData!.extraClaims = 1;
    const restored = Player.deserialize(player.serialize());
    expect(restored.individualTracksData).deep.eq(player.individualTracksData);
  });
});
