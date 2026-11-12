import * as constants from '../../common/constants';
import {BoardName} from '../../common/boards/BoardName';
import {CardName} from '../../common/cards/CardName';
import {ColonyName} from '../../common/colonies/ColonyName';
import {GameId} from '../../common/Types';
import {RandomMAOptionType} from '../../common/ma/RandomMAOptionType';
import {AgendaStyle} from '../../common/turmoil/Types';
import {Expansion} from '../../common/cards/GameModule';
import {EscapeVelocityOptions} from '../../common/game/NewGameConfig';
import {CustomMA} from '../../common/ma/CustomMA';

export type GameOptions = {
  boardName: BoardName;
  clonedGamedId: GameId | undefined;

  // Configuration
  undoOption: boolean;
  showTimers: boolean;
  fastModeOption: boolean;
  showOtherPlayersVP: boolean;

  // Extensions -- Deprecated, except when importing JSON
  corporateEra: boolean;
  venusNextExtension: boolean;
  coloniesExtension: boolean;
  preludeExtension: boolean;
  prelude2Expansion: boolean;
  turmoilExtension: boolean;
  promoCardsOption: boolean;
  communityCardsOption: boolean;
  aresExtension: boolean;
  aresHazards: boolean;
  aresExtremeVariant: boolean;
  politicalAgendasExtension: AgendaStyle;
  // Turmoil add-on: the six GIGA parties (6 of the 12 parties are drafted), two bonuses and policies per GIGA party, and the chairman reward wheel.
  gigaTurmoil: boolean;
  /** Domes and Wilderness (Epic): Dome and Wilderness standard projects, plus the option to upgrade a city or greenery instead of placing a new one. */
  domesWilderness: boolean;
  /** Individual global parameter tracks (Epic): each player's markers on the oxygen, temperature, oceans and cities tracks, with rewards along the way. */
  individualTracks: boolean;
  solarPhaseOption: boolean;
  removeNegativeGlobalEventsOption: boolean;
  moonExpansion: boolean;
  pathfindersExpansion: boolean;
  ceoExtension: boolean;
  starWarsExpansion: boolean;
  underworldExpansion: boolean;
  deltaProjectExpansion: boolean;
  bettermentsExpansion: boolean;
  robAntillesExpansion: boolean;
  solarisExpansion: boolean;
  idesofmarsExpansion: boolean;
  nuclearExpansion: boolean;
  /** Venus Phase 2 (GIGA): the Venus map, Venus standard projects and cards. Needs Venus Next. */
  venusPhase2Expansion: boolean;
  /** Eternity: fan-made cards, corporations and preludes. Cards that need another expansion only join with it. */
  eternityExpansion: boolean;
  /** Industries (GIGA): industry tiles bought as standard projects, in their own sub-menu. */
  industriesExpansion: boolean;
  postludesExpansion: boolean;

  expansions: Record<Expansion, boolean>,

  // Variants
  draftVariant: boolean;
  initialDraftVariant: boolean;
  preludeDraftVariant: boolean;
  ceosDraftVariant: boolean;
  // corporationsDraft: boolean;
  startingCorporations: number;
  shuffleMapOption: boolean;
  randomMA: RandomMAOptionType;
  includeFanMA: boolean;
  modularMA: boolean;
  /** Solo victory by getting TR 63 by game end */
  soloTR: boolean;
  /** A 1 player game played against MarsBot */
  automa: boolean;
  customCorporationsList: ReadonlyArray<CardName>;
  bannedCards: ReadonlyArray<CardName>;
  includedCards: ReadonlyArray<CardName>;
  customColoniesList: ReadonlyArray<ColonyName>;
  customPreludes: ReadonlyArray<CardName>;
  customCeos: ReadonlyArray<CardName>;
  /** Preselected milestones and awards, used instead of the board's. Only valid when randomMA is MANUAL. */
  customMA?: CustomMA;
  startingCeos: number;
  startingPreludes: number;
  /** Moon must be completed to end the game */
  requiresMoonTrackCompletion: boolean;
  /** Venus must be completed to end the game */
  requiresVenusTrackCompletion: boolean;
  /** Standard projects cost more MC and do not require steel or titanium */
  moonStandardProjectVariant: boolean;
  /** Standard projects can be paid for with steel or titanium at a 1MC loss per alloy */
  moonStandardProjectVariant1: boolean;
  altVenusBoard: boolean;
  /** Nuclear (GIGA): use the contamination track from the GIGA rules instead of the GIGA board's. */
  altContaminationTrack: boolean;
  escapeVelocity?: EscapeVelocityOptions;
  twoCorpsVariant: boolean;
  /** Merger+2P: everyone gets Merger on top of 2 chosen preludes. Implies twoCorpsVariant. */
  mergerPlus2P: boolean;
}

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  altVenusBoard: false,
  altContaminationTrack: false,
  mergerPlus2P: false,
  aresExtension: false,
  aresHazards: true,
  aresExtremeVariant: false,
  boardName: BoardName.THARSIS,
  bannedCards: [],
  includedCards: [],
  ceoExtension: false,
  clonedGamedId: undefined,
  coloniesExtension: false,
  communityCardsOption: false,
  corporateEra: true,
  customCeos: [],
  customColoniesList: [],
  customCorporationsList: [],
  customMA: undefined,
  customPreludes: [],
  draftVariant: false,
  escapeVelocity: undefined,
  expansions: {
    corpera: false,
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
  },
  fastModeOption: false,
  includeFanMA: false,
  initialDraftVariant: false,
  modularMA: false,
  moonExpansion: false,
  moonStandardProjectVariant: false,
  moonStandardProjectVariant1: false,
  pathfindersExpansion: false,
  politicalAgendasExtension: 'Standard',
  gigaTurmoil: false,
  domesWilderness: false,
  individualTracks: false,
  preludeDraftVariant: false,
  ceosDraftVariant: false,
  preludeExtension: false,
  prelude2Expansion: false,
  promoCardsOption: false,
  randomMA: RandomMAOptionType.NONE,
  requiresMoonTrackCompletion: false,
  removeNegativeGlobalEventsOption: false,
  requiresVenusTrackCompletion: false,
  showOtherPlayersVP: false,
  showTimers: true,
  shuffleMapOption: false,
  solarPhaseOption: false,
  soloTR: false,
  startingCeos: constants.CEO_CARDS_DEALT_PER_PLAYER,
  startingCorporations: constants.CORPORATION_CARDS_DEALT_PER_PLAYER,
  startingPreludes: constants.PRELUDE_CARDS_DEALT_PER_PLAYER,
  starWarsExpansion: false,
  turmoilExtension: false,
  underworldExpansion: false,
  deltaProjectExpansion: false,
  bettermentsExpansion: false,
  robAntillesExpansion: false,
  solarisExpansion: false,
  idesofmarsExpansion: false,
  nuclearExpansion: false,
  venusPhase2Expansion: false,
  eternityExpansion: false,
  industriesExpansion: false,
  postludesExpansion: false,
  automa: false,
  undoOption: false,
  venusNextExtension: false,
  twoCorpsVariant: false,
};
