import {BoardName} from '../common/boards/BoardName';
import {DEFAULT_EXPANSIONS} from '../common/cards/GameModule';
import {PLAYER_COLORS} from '../common/Color';
import {BotDifficulty, NewGameConfig, NewPlayerModel} from '../common/game/NewGameConfig';
import {RandomMAOptionType} from '../common/ma/RandomMAOptionType';

/** A plain 2-6 player Tharsis game with every seat played by a bot. */
export function baseConfig(playerCount: number, botDifficulty: BotDifficulty = 'easy'): NewGameConfig {
  const players: Array<NewPlayerModel> = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({name: `Bot ${i + 1}`, color: PLAYER_COLORS[i], beginner: false, handicap: 0, first: i === 0, botDifficulty});
  }
  return {
    players,
    expansions: {...DEFAULT_EXPANSIONS},
    boards: [BoardName.THARSIS],
    seed: 0,
    randomFirstPlayer: false,
    clonedGamedId: undefined,
    undoOption: false,
    showTimers: false,
    fastModeOption: false,
    showOtherPlayersVP: false,
    aresExtremeVariant: false,
    politicalAgendasExtension: 'Standard',
    gigaTurmoil: false,
    domesWilderness: false,
    individualTracks: false,
    solarPhaseOption: false,
    removeNegativeGlobalEventsOption: false,
    modularMA: false,
    draftVariant: false,
    initialDraft: false,
    preludeDraftVariant: false,
    ceosDraftVariant: false,
    startingCorporations: 2,
    shuffleMapOption: false,
    randomMA: RandomMAOptionType.NONE,
    includeFanMA: false,
    soloTR: false,
    customCorporationsList: [],
    bannedCards: [],
    includedCards: [],
    customColoniesList: [],
    customPreludes: [],
    requiresMoonTrackCompletion: false,
    requiresVenusTrackCompletion: false,
    moonStandardProjectVariant: false,
    moonStandardProjectVariant1: false,
    coloniesTradeFleetProject: false,
    altVenusBoard: false,
    altContaminationTrack: false,
    escapeVelocity: undefined,
    twoCorpsVariant: false,
    mergerPlus2P: false,
    customCeos: [],
    startingCeos: 3,
    startingPreludes: 4,
  };
}
