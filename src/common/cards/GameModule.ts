export const EXPANSIONS = [
  'corpera',
  'promo',
  'venus',
  'colonies',
  'prelude',
  'prelude2',
  'turmoil',
  'community',
  'ares',
  'moon',
  'pathfinders',
  'ceo',
  'starwars',
  'underworld',
  'deltaProject',
  'betterments',
  'robantilles',
  'solaris',
  'idesofmars',
  'nuclear',
  'venusphase2',
  'eternity',
  'industries',
  'postludes',
  'highorbit',
  'mercury',
  'epic',
] as const;

export const GAME_MODULES = [
  'base',
  ...EXPANSIONS,
] as const;
export type GameModule = typeof GAME_MODULES[number];

export type Expansion = Exclude<GameModule, 'base'>;

export const MODULE_NAMES = {
  base: 'Base',
  corpera: 'Corporate Era',
  promo: 'Promo',
  venus: 'Venus Next',
  colonies: 'Colonies',
  prelude: 'Prelude',
  prelude2: 'Prelude 2',
  turmoil: 'Turmoil',
  community: 'Community',
  ares: 'Ares',
  moon: 'The Moon',
  pathfinders: 'Pathfinders',
  ceo: 'CEOs',
  starwars: 'Star Wars',
  underworld: 'Underworld',
  deltaProject: 'Delta Project',
  betterments: 'Corporate Betterments',
  robantilles: 'Rob Antilles',
  solaris: 'Solaris',
  idesofmars: 'Ides of Mars',
  nuclear: 'Nuclear',
  venusphase2: 'Venus Phase 2',
  eternity: 'Eternity',
  industries: 'Industries',
  postludes: 'Postludes',
  highorbit: 'High Orbit',
  mercury: 'Mercury vs Mars',
  epic: 'Epic Corporations',
} satisfies Record<GameModule, string>;

export const DEFAULT_EXPANSIONS = {
  corpera: true,
  promo: false,
  venus: false,
  colonies: false,
  prelude: false,
  prelude2: false,
  turmoil: false,
  community: false,
  ares: false,
  moon: false,
  pathfinders: false,
  ceo: false,
  starwars: false,
  underworld: false,
  deltaProject: false,
  betterments: false,
  robantilles: false,
  solaris: false,
  idesofmars: false,
  nuclear: false,
  venusphase2: false,
  eternity: false,
  industries: false,
  postludes: false,
  highorbit: false,
  mercury: false,
  epic: false,
} satisfies Record<Expansion, boolean>;

/**
 * Epic Corporations (fan set): the official expansions its corporations rely on. The create-game form ticks
 * them along with it. Unticking one later only leaves out the corporations that need it (see each corporation's
 * `compatibility` in EpicCardManifest.ts); Epic Corporations stays ticked. The few corporations that need a fan
 * expansion (Mercury vs Mars, Nuclear, Solaris) join only when that expansion is ticked.
 */
export const EPIC_CORPORATIONS_NEEDS: ReadonlyArray<Expansion> = ['prelude', 'venus', 'colonies', 'turmoil', 'pathfinders'];
