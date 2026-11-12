import {Postludes} from '../postludes/Postludes';
import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {Priority} from '../deferredActions/Priority';
import {PlaceOceanTile} from '../deferredActions/PlaceOceanTile';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import {GlobalParameter} from '@/common/GlobalParameter';
import {Resource} from '@/common/Resource';
import {Tag} from '@/common/cards/Tag';
import {
  INDIVIDUAL_TRACK_NAMES,
  INDIVIDUAL_TRACKS,
  IndividualTrackName,
  IndividualTrackReward,
  LEADER_VICTORY_POINTS,
} from '@/common/individualTracks/IndividualTracks';
import {IndividualTracksPlayerModel} from '@/common/models/IndividualTracksPlayerModel';
import {IProjectCard} from '../cards/IProjectCard';

const LEADER_RESOURCES = {
  plants: Resource.PLANTS,
  heat: Resource.HEAT,
  steel: Resource.STEEL,
  megacredits: Resource.MEGACREDITS,
} as const;

/**
 * Rules for the individual global parameter tracks (Epic): each player moves a marker one step for every
 * step they raise oxygen or temperature, every ocean they place, and every time they place a city or play
 * a card with a city tag (once if one card or action does both). Reaching a reward spot gives its reward,
 * the leader of each track gets a resource in each production phase, and at the end of the game 3 VP.
 */
export class IndividualTracks {
  private constructor() {}

  public static enabled(game: IGame): boolean {
    return game.gameOptions.individualTracks === true;
  }

  public static initialPlayerData(): IndividualTracksPlayerModel {
    return {
      positions: {oxygen: 0, temperature: 0, oceans: 0, cities: 0},
      extraClaims: 0,
    };
  }

  /** Moves the marker of `player` forward `steps`, collecting the reward of every spot it reaches. */
  public static advance(player: IPlayer, track: IndividualTrackName, steps: number): void {
    const data = player.individualTracksData;
    if (data === undefined || steps <= 0) {
      return;
    }
    const spec = INDIVIDUAL_TRACKS[track];
    const from = data.positions[track];
    const to = Math.min(spec.length, from + steps);
    if (to === from) {
      return;
    }
    data.positions[track] = to;
    for (const {step, reward} of spec.rewards) {
      if (step > from && step <= to) {
        IndividualTracks.grant(player, data, track, reward);
      }
    }
  }

  /** Called when `player` raises oxygen or temperature or places an ocean. Other parameters have no track. */
  public static onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number): void {
    switch (parameter) {
    case GlobalParameter.OXYGEN:
    case GlobalParameter.TEMPERATURE:
    case GlobalParameter.OCEANS:
      IndividualTracks.advance(player, parameter, steps);
      break;
    }
  }

  /**
   * Called before `card` is played. A card with a city tag moves the cities marker once, and any city it
   * places during the same play does not move it a second time.
   */
  public static beforeCardPlayed(player: IPlayer, card: IProjectCard): void {
    const data = player.individualTracksData;
    if (data === undefined || !card.tags.includes(Tag.CITY)) {
      return;
    }
    IndividualTracks.advance(player, 'cities', 1);
    data.cityCreditedByCard = true;
    player.defer(() => {
      data.cityCreditedByCard = false;
      return undefined;
    }, Priority.BACK_OF_THE_LINE);
  }

  /** Called when `player` places a city tile or puts a dome on a city. */
  public static onCityPlaced(player: IPlayer): void {
    if (player.individualTracksData?.cityCreditedByCard === true) {
      return;
    }
    IndividualTracks.advance(player, 'cities', 1);
  }

  /** True when `player` has an extra milestone claim or award funding to use. */
  public static hasExtraClaim(player: IPlayer): boolean {
    return player.game.players.length > 1 && (player.individualTracksData?.extraClaims ?? 0) > 0;
  }

  /** Uses up one extra claim of `player`. Returns false when they have none. */
  public static spendExtraClaim(player: IPlayer): boolean {
    const data = player.individualTracksData;
    if (data === undefined || !IndividualTracks.hasExtraClaim(player)) {
      return false;
    }
    data.extraClaims--;
    return true;
  }

  /** The players furthest along `track`, all of them on a tie. Nobody leads a track no one has moved on. */
  public static leaders(game: IGame, track: IndividualTrackName): Array<IPlayer> {
    const furthest = Math.max(0, ...game.players.map((p) => p.individualTracksData?.positions[track] ?? 0));
    if (furthest === 0) {
      return [];
    }
    return game.players.filter((p) => p.individualTracksData?.positions[track] === furthest);
  }

  /** Gives the leaders of each track their resource from the World Government. Called in the production phase. */
  public static grantLeaderRewards(game: IGame): void {
    if (!IndividualTracks.enabled(game)) {
      return;
    }
    for (const track of INDIVIDUAL_TRACK_NAMES) {
      const {resource, count} = INDIVIDUAL_TRACKS[track].leaderReward;
      for (const leader of IndividualTracks.leaders(game, track)) {
        leader.stock.add(LEADER_RESOURCES[resource], count, {log: true});
        game.log('${0} leads the ${1} track', (b) => b.player(leader).string(track));
      }
    }
  }

  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder): void {
    if (player.individualTracksData === undefined) {
      return;
    }
    for (const track of INDIVIDUAL_TRACK_NAMES) {
      if (IndividualTracks.leaders(player.game, track).includes(player)) {
        builder.setVictoryPoints('victoryPoints', LEADER_VICTORY_POINTS, 'Leads the ${0} track', [track]);
      }
    }
  }

  private static grant(player: IPlayer, data: IndividualTracksPlayerModel, track: IndividualTrackName, reward: IndividualTrackReward): void {
    const game = player.game;
    switch (reward) {
    case 'postlude':
      game.log('${0} reached the Postlude spot on the ${1} track', (b) => b.player(player).string(track));
      Postludes.gain(player, track);
      break;
    case 'plantProduction':
      player.production.add(Resource.PLANTS, 1, {log: true});
      break;
    case 'heatProduction':
      player.production.add(Resource.HEAT, 1, {log: true});
      break;
    case 'steelProduction':
      player.production.add(Resource.STEEL, 1, {log: true});
      break;
    case 'ocean':
      game.log('${0} reached the ocean spot on the ${1} track', (b) => b.player(player).string(track));
      game.defer(new PlaceOceanTile(player));
      break;
    case 'milestoneAward':
      data.extraClaims++;
      game.log('${0} earned an extra milestone or award on the ${1} track', (b) => b.player(player).string(track));
      break;
    }
  }
}
