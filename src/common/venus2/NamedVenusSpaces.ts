import {ValueOf} from '../utils/utils';
import {SpaceName} from '../boards/SpaceName';

/** Reserved spaces on the Venus Phase 2 map. */
export const NamedVenusSpaces = {
  STRATOPOLIS: 'v12',
  MAXWELL_BASE: 'v25',
} as const;

export type NamedVenusSpace = ValueOf<typeof NamedVenusSpaces>;

/**
 * Off-world city spaces next to Mars whose cities go on the Venus map instead when
 * Venus Phase 2 is in play. The Mars board leaves these spaces out in those games.
 */
export const VENUS_MAP_CITY_SPACES: ReadonlyArray<string> = [
  SpaceName.STRATOPOLIS,
  SpaceName.MAXWELL_BASE,
  SpaceName.DYSON_SCREENS,
  SpaceName.VENERA_BASE,
];
