import {BoardName} from '../../common/boards/BoardName';
import {Expansion, EXPANSIONS} from '../../common/cards/GameModule';
import {GameOptions} from '../game/GameOptions';

type MAManifestSpec<V> = {
  /** Constructor that a new instance of this MA. */
  Factory: new () => V;
  /** If set, the module this MA needs to function. */
  compatibility?: Expansion;
  /** A second module this MA needs (Solarist needs Mercury vs Mars and Pathfinders). */
  alsoNeeds?: Expansion;
  /** When true, do not include in any new games when picking randomly. */
  deprecated?: true;
  /** Drawn in modular games, both types, or (undefined) only non-modular games. */
  random?: 'modular' | 'both';
  /**
   * GIGA fan milestone or award. Only drawn when "Include fan Milestones/Awards" is on, and never in modular games
   * (unless `random` says so).
   */
  fan?: true;
}
type ExpansionsWithMAs = 'venus' | 'ares' | 'moon' | 'underworld';

export type MAManifest<K extends string, V> = {
  all: Record<K, MAManifestSpec<V>>,
  boards: Record<BoardName, ReadonlyArray<K>>,
  expansions: Record<ExpansionsWithMAs, ReadonlyArray<K>>;
  create(name: string): V | undefined;
  createOrThrow(name: string): V;
}

export function isCompatible<T extends string>(name: T, manifest: MAManifest<T, any>, gameOptions: GameOptions) {
  const spec = manifest.all[name];
  const needed = [spec.compatibility, spec.alsoNeeds].filter((e) => e !== undefined);
  for (const expansion of EXPANSIONS) {
    if (needed.includes(expansion)) {
      if (gameOptions.expansions[expansion] !== true) {
        return false;
      }
    }
  }
  return true;
}
