import {ValueOf} from '../utils/utils';

/** Reserved spaces on the Venus Phase 2 map. */
export const NamedVenusSpaces = {
  STRATOPOLIS: 'v12',
  MAXWELL_BASE: 'v25',
} as const;

export type NamedVenusSpace = ValueOf<typeof NamedVenusSpaces>;
