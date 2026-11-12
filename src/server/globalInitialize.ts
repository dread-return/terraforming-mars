import {registerBehaviorExecutor} from './behavior/BehaviorExecutor';
import {Executor} from './behavior/Executor';
import {initializeGlobalEventDealer} from './turmoil/globalEvents/GlobalEventDealer';
import {ALL_MODULE_MANIFESTS} from './cards/AllManifests';
import {GIGA_GLOBAL_EVENTS} from './turmoil/giga/GigaGlobalEvents';

export function globalInitialize() {
  registerBehaviorExecutor(new Executor());
  initializeGlobalEventDealer(ALL_MODULE_MANIFESTS, GIGA_GLOBAL_EVENTS);
}
