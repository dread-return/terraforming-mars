import {BoardName} from '../../common/boards/BoardName';
import {NewGameConfig} from '../../common/game/NewGameConfig';
import {sanitizeEscapeVelocityOptions} from '../../common/game/escapeVelocity';
import {GameOptions} from './GameOptions';

/**
 * Converts the create-game request into the game's options.
 *
 * Shared by the create-game route and the bot simulator (src/tools/botSim.ts), so the simulator exercises exactly the
 * option mapping real games get.
 */
export function gameOptionsFromConfig(gameReq: NewGameConfig, boardName: BoardName): GameOptions {
  const gigaTurmoil = gameReq.expansions.turmoil === true && gameReq.gigaTurmoil === true;
  const gameOptions: GameOptions = {
    // Venus Phase 2's Venus track replaces the Alt. Venus board.
    altVenusBoard: gameReq.altVenusBoard && !(gameReq.expansions.venusphase2 === true && gameReq.expansions.venus === true),
    altContaminationTrack: gameReq.altContaminationTrack ?? false,
    aresExtension: gameReq.expansions.ares,
    aresHazards: true, // Not a runtime option.
    aresExtremeVariant: gameReq.aresExtremeVariant,
    automa: false, // No create-game UI yet.
    bannedCards: gameReq.bannedCards,
    boardName: boardName,
    ceoExtension: gameReq.expansions.ceo,
    clonedGamedId: gameReq.clonedGamedId,
    coloniesExtension: gameReq.expansions.colonies,
    communityCardsOption: gameReq.expansions.community,
    expansions: gameReq.expansions,
    ceosDraftVariant: gameReq.ceosDraftVariant,
    corporateEra: gameReq.expansions.corpera,
    customCeos: gameReq.customCeos,
    customColoniesList: gameReq.customColoniesList,
    customCorporationsList: gameReq.customCorporationsList,
    customMA: gameReq.customMA,
    customPreludes: gameReq.customPreludes,
    draftVariant: gameReq.draftVariant,
    escapeVelocity: gameReq.escapeVelocity === undefined ? undefined : sanitizeEscapeVelocityOptions(gameReq.escapeVelocity),
    fastModeOption: gameReq.fastModeOption,
    includedCards: gameReq.includedCards,
    includeFanMA: gameReq.includeFanMA,
    initialDraftVariant: gameReq.initialDraft,
    modularMA: gameReq.modularMA,
    moonExpansion: gameReq.expansions.moon,
    moonStandardProjectVariant: gameReq.moonStandardProjectVariant,
    moonStandardProjectVariant1: gameReq.moonStandardProjectVariant1,
    coloniesTradeFleetProject: gameReq.coloniesTradeFleetProject === true && gameReq.expansions.colonies,
    pathfindersExpansion: gameReq.expansions.pathfinders,
    // With Giga Turmoil the chairman always chooses the bonus and policy.
    politicalAgendasExtension: gigaTurmoil ? 'Chairman' : gameReq.politicalAgendasExtension,
    gigaTurmoil: gigaTurmoil,
    domesWilderness: gameReq.domesWilderness === true,
    // Postludes are gained from the individual tracks, so they turn the tracks on.
    individualTracks: gameReq.individualTracks === true || gameReq.expansions.postludes === true,
    // 5 milestones and 5 awards (6 with Venus Next), like the official game.
    officialMilestoneAwardCount: true,
    prelude2Expansion: gameReq.expansions.prelude2,
    preludeDraftVariant: gameReq.preludeDraftVariant,
    preludeExtension: gameReq.expansions.prelude,
    promoCardsOption: gameReq.expansions.promo,
    randomMA: gameReq.randomMA,
    removeNegativeGlobalEventsOption: gameReq.removeNegativeGlobalEventsOption,
    requiresMoonTrackCompletion: gameReq.requiresMoonTrackCompletion,
    requiresVenusTrackCompletion: gameReq.requiresVenusTrackCompletion,
    showOtherPlayersVP: gameReq.showOtherPlayersVP,
    showTimers: gameReq.showTimers,
    shuffleMapOption: gameReq.shuffleMapOption,
    solarPhaseOption: gameReq.solarPhaseOption,
    soloTR: gameReq.soloTR,
    startingCeos: gameReq.startingCeos,
    startingCorporations: gameReq.startingCorporations,
    startingPreludes: gameReq.startingPreludes,
    starWarsExpansion: gameReq.expansions.starwars,
    turmoilExtension: gameReq.expansions.turmoil,
    twoCorpsVariant: gameReq.twoCorpsVariant || gameReq.mergerPlus2P === true,
    mergerPlus2P: gameReq.mergerPlus2P ?? false,
    underworldExpansion: gameReq.expansions.underworld,
    deltaProjectExpansion: gameReq.expansions.deltaProject,
    bettermentsExpansion: gameReq.expansions.betterments,
    robAntillesExpansion: gameReq.expansions.robantilles,
    solarisExpansion: gameReq.expansions.solaris,
    idesofmarsExpansion: gameReq.expansions.idesofmars,
    nuclearExpansion: gameReq.expansions.nuclear,
    // Venus Phase 2 needs Venus Next.
    venusPhase2Expansion: gameReq.expansions.venusphase2 === true && gameReq.expansions.venus === true,
    eternityExpansion: gameReq.expansions.eternity ?? false,
    industriesExpansion: gameReq.expansions.industries ?? false,
    postludesExpansion: gameReq.expansions.postludes ?? false,
    highOrbitExpansion: gameReq.expansions.highorbit ?? false,
    mercuryExpansion: gameReq.expansions.mercury ?? false,
    undoOption: gameReq.undoOption,
    venusNextExtension: gameReq.expansions.venus,
  };
  return gameOptions;
}
