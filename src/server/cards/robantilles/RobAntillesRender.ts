import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
import {CardRenderDynamicVictoryPoints} from '../../../common/cards/render/CardRenderDynamicVictoryPoints';
import {CardRenderItem} from '../render/CardRenderItem';
import {Size} from '../../../common/cards/render/Size';

/** VP rendering for "1 VP per N greenery tiles you own". */
export function greeneries(points: number, target: number): CardRenderDynamicVictoryPoints {
  const item = new CardRenderItem(CardRenderItemType.GREENERY);
  item.size = Size.SMALL;
  return {item, points, target};
}

/** VP rendering for "1 VP per adjacent special tile" and similar per-tile counts. */
export function specialTiles(points: number, target: number): CardRenderDynamicVictoryPoints {
  const item = new CardRenderItem(CardRenderItemType.EMPTY_TILE_SPECIAL);
  item.size = Size.SMALL;
  return {item, points, target, asterisk: true};
}
