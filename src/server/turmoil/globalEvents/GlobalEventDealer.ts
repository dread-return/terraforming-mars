import {GlobalEventName} from '../../../common/turmoil/globalEvents/GlobalEventName';
import {IGlobalEvent} from './IGlobalEvent';
import {IGame} from '../../IGame';
import {SerializedGlobalEventDealer} from './SerializedGlobalEventDealer';
import {GlobalEventManifest, ModuleManifest} from '../../cards/ModuleManifest';
import {isCompatibleWith} from '../../cards/CardFactorySpec';
import {inplaceShuffle} from '../../utils/shuffle';
import {GameModule} from '../../../common/cards/GameModule';
import {toName} from '../../../common/utils/utils';

// When renaming, add the rename here and add a TODO (like the example below)
// And remember to add a test in GlobalEventDealer.spec.ts
const RENAMED_GLOBAL_EVENTS: Array<[GlobalEventName, GlobalEventFactory]> = [
  // ['Miners Of Strike' as GlobalEventName, MinersOnStrike],
];

type GlobalEventFactory = new () => IGlobalEvent;

const ALL_EVENTS = new Map<GlobalEventName, GlobalEventFactory>();
// A local copy supplied to prevent import cycles
const ALL_MODULE_MANIFESTS: Array<ModuleManifest> = [];
// The global events of Giga Turmoil. They are not part of a card module: they join the deck of every game that uses Giga Turmoil.
let GIGA_EVENTS: GlobalEventManifest = {};

// Only called once during setup. Call with ALL_MODULE_MANIFESTS
export function initializeGlobalEventDealer(allModuleManifests: Array<ModuleManifest>, gigaEvents: GlobalEventManifest = {}) {
  if (ALL_EVENTS.size > 0) {
    return;
  }
  ALL_MODULE_MANIFESTS.push(...allModuleManifests);
  GIGA_EVENTS = gigaEvents;
  for (const card of GlobalEventManifest.entries(gigaEvents)) {
    ALL_EVENTS.set(card[0], card[1].Factory);
  }
  for (const manifest of allModuleManifests) {
    for (const card of GlobalEventManifest.entries(manifest.globalEvents)) {
      ALL_EVENTS.set(card[0], card[1].Factory);
    }
  }
  for (const card of RENAMED_GLOBAL_EVENTS) {
    ALL_EVENTS.set(card[0], card[1]);
  }
}

export function getGlobalEventByName(globalEventName: GlobalEventName): IGlobalEvent | undefined {
  const Factory = ALL_EVENTS.get(globalEventName);

  if (Factory !== undefined) {
    return new Factory();
  }
  console.warn(`unable to find global event ${globalEventName}`);
  return undefined;
}

export class GlobalEventDealer {
  constructor(
    public readonly deck: Array<IGlobalEvent>,
    public readonly discards: Array<IGlobalEvent>) {}

  public static newInstance(game: IGame): GlobalEventDealer {
    const events: Array<IGlobalEvent> = [];

    const gameOptions = game.gameOptions;
    // TODO(kberg): Merge with GameCards.
    const includes: Record<GameModule, boolean> = {
      base: true,
      corpera: gameOptions.corporateEra,
      prelude: gameOptions.preludeExtension,
      prelude2: gameOptions.prelude2Expansion,
      venus: gameOptions.venusNextExtension,
      colonies: gameOptions.coloniesExtension,
      turmoil: gameOptions.turmoilExtension,
      ares: gameOptions.aresExtension,
      promo: gameOptions.promoCardsOption,
      community: gameOptions.communityCardsOption,
      moon: gameOptions.moonExpansion,
      pathfinders: gameOptions.pathfindersExpansion,
      ceo: gameOptions.ceoExtension,
      starwars: gameOptions.starWarsExpansion,
      underworld: gameOptions.underworldExpansion,
      deltaProject: gameOptions.deltaProjectExpansion,
      betterments: gameOptions.bettermentsExpansion,
      robantilles: gameOptions.robAntillesExpansion,
      solaris: gameOptions.solarisExpansion,
      idesofmars: gameOptions.idesofmarsExpansion,
      nuclear: gameOptions.nuclearExpansion,
      venusphase2: gameOptions.venusPhase2Expansion,
      eternity: gameOptions.eternityExpansion,
      industries: gameOptions.industriesExpansion,
      postludes: gameOptions.postludesExpansion,
    };

    for (const manifest of ALL_MODULE_MANIFESTS) {
      if (includes[manifest.module] !== true) {
        continue;
      }
      for (const card of GlobalEventManifest.entries(manifest.globalEvents)) {
        const factory = card[1];
        if (game.gameOptions.removeNegativeGlobalEventsOption && factory.negative === true) {
          continue;
        }
        if (isCompatibleWith(factory, game.gameOptions)) {
          events.push(new factory.Factory());
        }
      }
    }
    if (gameOptions.turmoilExtension && gameOptions.gigaTurmoil) {
      for (const card of GlobalEventManifest.entries(GIGA_EVENTS)) {
        const factory = card[1];
        if (gameOptions.removeNegativeGlobalEventsOption && factory.negative === true) {
          continue;
        }
        if (isCompatibleWith(factory, gameOptions)) {
          events.push(new factory.Factory());
        }
      }
    }
    inplaceShuffle(events, game.rng);
    return new GlobalEventDealer(events, []);
  }

  public draw(): IGlobalEvent | undefined {
    return this.deck.pop();
  }

  public discard(globalEvent: IGlobalEvent) {
    this.discards.push(globalEvent);
  }

  public serialize(): SerializedGlobalEventDealer {
    return {
      deck: this.deck.map(toName),
      discarded: this.discards.map(toName),
    };
  }

  public static deserialize(d: SerializedGlobalEventDealer): GlobalEventDealer {
    const deck: Array<IGlobalEvent> = [];
    d.deck.forEach((element: GlobalEventName) => {
      const globalEvent = getGlobalEventByName(element);
      if (globalEvent !== undefined) {
        deck.push(globalEvent);
      }
    });
    const discardPile: Array<IGlobalEvent> = [];
    d.discarded.forEach((element: GlobalEventName) => {
      const globalEvent = getGlobalEventByName(element);
      if (globalEvent !== undefined) {
        discardPile.push(globalEvent);
      }
    });
    return new GlobalEventDealer(deck, discardPile);
  }
}
