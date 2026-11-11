import {IPlayer} from '../../IPlayer';
import {IGame} from '../../IGame';
import {IProjectCard} from '../../cards/IProjectCard';
import {ICard} from '../../cards/ICard';
import {Board} from '../../boards/Board';
import {Space} from '../../boards/Space';
import {SpaceType} from '../../../common/boards/SpaceType';
import {TileType} from '../../../common/TileType';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';
import {PartyName} from '../../../common/turmoil/PartyName';
import {BonusId, PolicyId} from '../../../common/turmoil/Types';
import {POLITICAL_AGENDAS_MAX_ACTION_USES} from '../../../common/constants';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';
import {Phase} from '../../../common/Phase';

/**
 * Helpers shared by the Giga Turmoil parties. Giga Turmoil follows the Epic rules, where every
 * party has two bonuses (A and B) and four policies (1 to 4).
 */

/** A bonus that gives 1 or more M€ per something the player has. */
export class MegacreditBonus extends Bonus {
  constructor(
    public readonly id: BonusId,
    private readonly partyName: PartyName,
    public readonly description: string,
    private readonly score: (player: IPlayer) => number) {
    super();
  }

  public getScore(player: IPlayer): number {
    return this.score(player);
  }

  public grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: this.partyName}});
  }
}

/** True when `space` is on the Mars board (not a colony space, not on Venus or the Moon). */
export function isOnMars(game: IGame, space: Space): boolean {
  return space.spaceType !== SpaceType.COLONY && game.board.spaces.includes(space);
}

/** Tiles `player` owns on Mars. */
export function tilesOnMars(player: IPlayer): number {
  return player.game.board.spaces.filter((space) => space.tile !== undefined && space.spaceType !== SpaceType.COLONY && Board.spaceOwnedBy(space, player)).length;
}

/** Number of different kinds of tiles `player` owns. */
export function kindsOfTiles(player: IPlayer): number {
  const kinds = new Set<TileType>();
  for (const space of player.game.board.spaces) {
    if (space.tile !== undefined && Board.spaceOwnedBy(space, player)) {
      kinds.add(space.tile.tileType);
    }
  }
  for (const space of player.game.board.venusMap?.spaces ?? []) {
    if (space.tile !== undefined && Board.spaceOwnedBy(space, player)) {
      kinds.add(space.tile.tileType);
    }
  }
  return kinds.size;
}

/** Number of delegates `player` has placed in the parties (not the reserve or the chairman seat). */
export function countDelegatesInParties(player: IPlayer): number {
  const turmoil = player.game.turmoil;
  if (turmoil === undefined) {
    return 0;
  }
  let count = 0;
  for (const party of turmoil.parties) {
    count += party.delegates.get(player);
  }
  return count;
}

/** Number of project cards `player` has played that have a tag requirement. */
export function cardsWithTagRequirement(player: IPlayer): number {
  return player.playedCards.filter((card) => card.type !== CardType.PROXY && card.requirements.some((r) => r.tag !== undefined)).length;
}

/** Played project cards that have no tag at all (events do not count). */
export function cardsWithoutTags(player: IPlayer): number {
  return player.playedCards.filter((card) => card.type !== CardType.PROXY && card.type !== CardType.EVENT &&
    card.type !== CardType.CORPORATION && card.type !== CardType.PRELUDE && card.type !== CardType.CEO && card.tags.length === 0).length;
}

/** Tiles `player` owns that are next to a city tile. */
export function tilesNextToCities(player: IPlayer): number {
  const board = player.game.board;
  return board.spaces.filter((space) => {
    return space.tile !== undefined && space.spaceType !== SpaceType.COLONY && Board.spaceOwnedBy(space, player) &&
      board.getAdjacentSpaces(space).some((adjacent) => Board.isCitySpace(adjacent));
  }).length;
}

/** All six production resources, in the order the Epic rules print them. */
export const ALL_PRODUCTIONS: ReadonlyArray<Resource> = [
  Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT,
];

/** Tags of `card` that `player` did not have before playing it. */
export function newTagsOn(player: IPlayer, card: ICard): number {
  const tags = new Set(card.tags.filter((tag) => tag !== Tag.EVENT && tag !== Tag.WILD && tag !== Tag.CLONE));
  let count = 0;
  for (const tag of tags) {
    // The card has already been played, so subtract its own copies.
    const own = card.tags.filter((t) => t === tag).length;
    if (player.tags.count(tag, 'raw') - own <= 0) {
      count++;
    }
  }
  return count;
}

/** True when the standard project action, or a card action, is allowed to be used again this generation. */
export function canUsePartyAction(player: IPlayer): boolean {
  return player.politicalAgendasActionUsedCount < POLITICAL_AGENDAS_MAX_ACTION_USES;
}

export function logPartyAction(player: IPlayer, partyName: PartyName): void {
  player.game.log('${0} used Turmoil ${1} action', (b) => b.player(player).partyName(partyName));
}

export type TagChoice = {
  readonly title: string,
  readonly include: (card: IProjectCard) => boolean,
};

export function tagChoice(tag: Tag): TagChoice {
  return {title: `Buy the first card with a ${tag} tag`, include: (card) => card.tags.includes(tag)};
}

/**
 * The "spend 4 M€ to buy the first card with that tag" action every party has as policy 4.
 * The player pays 4 M€, then the deck is drawn from until a card that matches shows up, and the player keeps it.
 */
export function buyFirstCardPolicy(
  id: PolicyId,
  partyName: PartyName,
  description: string,
  choices: ReadonlyArray<TagChoice> | ((player: IPlayer) => ReadonlyArray<TagChoice>)): IPolicy {
  const resolve = (player: IPlayer) => typeof choices === 'function' ? choices(player) : choices;
  return {
    id,
    description,
    canAct(player: IPlayer) {
      return player.canAfford(4) && canUsePartyAction(player) && resolve(player).length > 0;
    },
    action(player: IPlayer) {
      const game = player.game;
      const options = resolve(player);
      const buy = (choice: TagChoice) => {
        logPartyAction(player, partyName);
        player.politicalAgendasActionUsedCount++;
        game.defer(new SelectPaymentDeferred(player, 4, {title: TITLES.payForPartyAction(partyName)}))
          .andThen(() => player.drawCard(1, {include: choice.include}));
        return undefined;
      };
      if (options.length === 1) {
        return buy(options[0]);
      }
      return new OrOptions(...options.map((choice) => new SelectOption(choice.title).andThen(() => buy(choice))));
    },
  };
}

/** True while it is the action phase. Many policies only matter then. */
export function inActionPhase(player: IPlayer): boolean {
  return player.game.phase === Phase.ACTION;
}
