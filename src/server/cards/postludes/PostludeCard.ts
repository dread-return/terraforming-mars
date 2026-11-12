import {Card, StaticCardProperties} from '../Card';
import {IPostludeCard} from './IPostludeCard';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SelectSpace} from '../../inputs/SelectSpace';
import {PlayerInput} from '../../PlayerInput';
import {Tag} from '../../../common/cards/Tag';
import {PostludeKind} from '../../../common/postludes/Postludes';
import {Postludes} from '../../postludes/Postludes';
import {DomesWilderness} from '../../domesWilderness/DomesWilderness';
import {CardRenderItem} from '../render/CardRenderItem';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {CardRenderDynamicVictoryPoints} from '../../../common/cards/render/CardRenderDynamicVictoryPoints';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export type PostludeProperties = StaticCardProperties & {postludeKind: PostludeKind};

/**
 * The VP icon of a card that gives `points` VP per `target` of something. `type` is what's counted.
 */
export function postludeVp(
  type: typeof CardRenderItemType[keyof typeof CardRenderItemType],
  points: number,
  target: number,
  options: {asterisk?: boolean, tag?: Tag, resource?: CardResource, production?: boolean} = {}): CardRenderDynamicVictoryPoints {
  const item = new CardRenderItem(type, 1, {size: Size.SMALL, tag: options.tag, resource: options.resource});
  return {
    item,
    points,
    target,
    asterisk: options.asterisk,
    production: options.production,
  };
}

/**
 * Base class of the Postlude cards (Epic / GIGA edition).
 *
 * A postlude is played from hand like a project card, and goes on top of one of the player's cities,
 * a greenery, or any ocean. The card remembers nothing about where it is: the space has `tile.postlude` set,
 * and `Postludes.spaceOf` finds it again.
 */
export abstract class PostludeCard extends Card implements IPostludeCard {
  public readonly postludeKind: PostludeKind;

  constructor(properties: PostludeProperties) {
    const {postludeKind, ...rest} = properties;
    super(rest);
    this.postludeKind = postludeKind;
  }

  /** Extra conditions on the space, like a city next to an ocean. */
  protected spaceAllowed(_player: IPlayer, _space: Space): boolean {
    return true;
  }

  public eligibleSpaces(player: IPlayer): ReadonlyArray<Space> {
    return Postludes.spacesFor(player, this.postludeKind).filter((space) => this.spaceAllowed(player, space));
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return this.eligibleSpaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer): PlayerInput | undefined {
    const spaces = this.eligibleSpaces(player);
    return new SelectSpace(`Select space for ${this.name}`, spaces)
      .andThen((space) => {
        Postludes.place(player, this, space);
        this.onPlaced(player, space);
        return undefined;
      });
  }

  /** What the postlude does when it goes on the board, apart from sitting there. */
  protected onPlaced(_player: IPlayer, _space: Space): void {}

  // ---- Helpers for looking around the postlude ------------------------------------------------------------------

  protected adjacentTiles(player: IPlayer): Array<Space> {
    return Postludes.adjacentTiles(player.game, this.name);
  }

  protected adjacentEmpty(player: IPlayer): Array<Space> {
    return Postludes.adjacentEmpty(player.game, this.name);
  }

  /** Tiles next to the postlude that belong to `player`. */
  protected ownAdjacentTiles(player: IPlayer): Array<Space> {
    return this.adjacentTiles(player).filter((space) => Board.spaceOwnedBy(space, player));
  }

  protected adjacentOceans(player: IPlayer): Array<Space> {
    return this.adjacentTiles(player).filter(Board.isOceanSpace);
  }

  /** Cities next to the postlude. A dome counts as two for effects, and as one when scoring. */
  protected adjacentCityCount(player: IPlayer, forScoring: boolean = false): number {
    const cities = this.adjacentTiles(player).filter(Board.isCitySpace);
    return forScoring ? cities.length : DomesWilderness.countCities(cities);
  }

  protected adjacentGreeneryCount(player: IPlayer, options: {forScoring?: boolean, ownOnly?: boolean} = {}): number {
    let greeneries = this.adjacentTiles(player).filter(Board.isGreenerySpace);
    if (options.ownOnly === true) {
      greeneries = greeneries.filter((space) => Board.spaceOwnedBy(space, player));
    }
    return options.forScoring === true ? greeneries.length : DomesWilderness.countGreeneries(greeneries);
  }

  /**
   * Tags `player` has, including this card's own while it is still being played. Cards are put with the
   * player's cards after `play`, so a postlude that says "including this" must add its own.
   */
  protected tagCount(player: IPlayer, tag: Tag): number {
    const own = player.tableau.has(this.name) ? 0 : this.tags.filter((t) => t === tag).length;
    return player.tags.count(tag) + own;
  }
}
