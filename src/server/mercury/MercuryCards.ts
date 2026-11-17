import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tag} from '../../common/cards/Tag';
import {StandardProjectCanPayWith} from '../../common/cards/Types';
import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';

/** Cards whose play places a colony ("any action that results in placing a colony"). */
const COLONY_CARDS: ReadonlySet<CardName> = new Set([
  CardName.MERCURIAL_SHADOW_COLONY,
  CardName.SECRET_BLACK_MARKET,
  CardName.NEW_HORIZONS,
  CardName.MERCURIAL_BASE,
  CardName.BUILD_COLONY_STANDARD_PROJECT,
]);

/** True when playing `card` (or doing the standard project) places a colony. */
export function placesColony(card: ICard): boolean {
  return COLONY_CARDS.has(card.name) || card.behavior?.colonies?.buildColony !== undefined;
}

/**
 * Hephaestus Works: steel pays for cards with a Mercury tag, space events, and anything that places a colony.
 */
export function mercuryCanUseSteel(player: IPlayer, card: ICard): boolean {
  if (!player.tableau.has(CardName.HEPHAESTUS_WORKS)) {
    return false;
  }
  if (card.tags.includes(Tag.MERCURY)) {
    return true;
  }
  if (card.type === CardType.EVENT && card.tags.includes(Tag.SPACE)) {
    return true;
  }
  return placesColony(card);
}

/** Hephaestus Works: steel pays for the Build Colony standard project. */
export function mercuryStandardProjectPayWith(player: IPlayer, card: ICard, base: StandardProjectCanPayWith): StandardProjectCanPayWith {
  if (card.name === CardName.BUILD_COLONY_STANDARD_PROJECT && player.tableau.has(CardName.HEPHAESTUS_WORKS)) {
    return {...base, steel: true};
  }
  return base;
}

/** True when `card` places a special tile (Technology Acquisition and Reinvestments skip those). */
export function placesSpecialTile(card: ICard): boolean {
  return card.behavior?.tile !== undefined || card.tilesBuilt.length > 0;
}
