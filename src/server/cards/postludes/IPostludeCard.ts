import {PostludeKind} from '../../../common/postludes/Postludes';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {IProjectCard} from '../IProjectCard';

/** A postlude card: a project card that goes on top of a city, a greenery or an ocean. */
export interface IPostludeCard extends IProjectCard {
  readonly postludeKind: PostludeKind;
  /** The spaces `player` could put this postlude on. */
  eligibleSpaces(player: IPlayer): ReadonlyArray<Space>;
}

export function isPostludeCard(card: {name: string}): card is IPostludeCard {
  return (card as Partial<IPostludeCard>).postludeKind !== undefined;
}
