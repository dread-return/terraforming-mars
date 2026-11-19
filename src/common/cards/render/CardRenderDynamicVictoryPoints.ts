import {ICardRenderItem} from './Types';

export type CardRenderDynamicVictoryPoints = {
  points: number;
  target: number;
  item?: ICardRenderItem;
  // marking target to be one or more res (Search for Life)
  targetOneOrMore?: boolean;
  // Law Suit
  anyPlayer?: boolean;
  // Show an asterisk
  asterisk?: boolean;
  asFraction?: boolean;
  vermin?: boolean;
  /** Eternity: more items after `item`, joined with a plus (e.g. science + microbe tags). */
  extraItems?: Array<ICardRenderItem>;
  /** Eternity: draw `item` inside a production box. */
  production?: boolean;
  /** Epic: what goes between `item` and `extraItems`. Defaults to a plus; '' draws them side by side (a set). */
  joiner?: string;
  /** Epic: replaces the "points/target" text in front of the item ('' hides it). */
  label?: string;
  /** Epic: a second scoring term, drawn after this one (with a plus unless its points are negative). */
  also?: CardRenderDynamicVictoryPoints;
}
