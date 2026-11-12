import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {ALL_RESOURCES} from '../../../common/Resource';

/**
 * GIGA fan milestone. Counts the same thing as the Collector award: different types of resources, on the
 * player board and on cards. Not the same as T. Collector, which counts sets of cards.
 */
export class GCollector extends BaseMilestone {
  constructor() {
    super(
      'G. Collector',
      'Have 8 different types of resources, both on your player board and on your cards',
      8);
  }

  public getScore(player: IPlayer): number {
    const standardResources = ALL_RESOURCES.filter((res) => player.stock.get(res) > 0).length;
    const cardResources = new Set(player.getCardsWithResources().map((card) => card.resourceType)).size;
    return standardResources + cardResources;
  }
}
