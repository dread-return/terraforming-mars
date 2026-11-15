import {CardName} from '../../common/cards/CardName';
import {StandardProjectCanPayWith} from '../../common/cards/Types';
import {infrastructureDesign} from '../../common/highOrbit/HighOrbit';
import type {ICard} from '../cards/ICard';
import type {IPlayer} from '../IPlayer';

/**
 * Kept apart from HighOrbit.ts (which pulls in cards and the deck) so standard project code can import it
 * without an import cycle.
 */
export function shipyardOreCount(player: IPlayer): number {
  const design = infrastructureDesign(CardName.ORBITAL_SHIPYARD);
  if (design === undefined) {
    return 0;
  }
  let total = 0;
  for (const name of design.copies) {
    total += player.tableau.get(name)?.resourceCount ?? 0;
  }
  return total;
}

/** Orbital Shipyard: its ore pays 3 M€ each for the Build Colony standard project. */
export function highOrbitStandardProjectPayWith(player: IPlayer, card: ICard, base: StandardProjectCanPayWith): StandardProjectCanPayWith {
  if (card.name === CardName.BUILD_COLONY_STANDARD_PROJECT && shipyardOreCount(player) > 0) {
    return {...base, shipyardOre: true};
  }
  return base;
}
