import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {DomeStandardProject} from './DomeStandardProject';
import {WildernessStandardProject} from './WildernessStandardProject';

/**
 * The Domes and Wilderness standard projects. This is a game option, not an expansion, so the manifest is
 * filed under the base module and `GameCards` adds it only when the option is on.
 */
export const DOMES_WILDERNESS_CARD_MANIFEST = new ModuleManifest({
  module: 'base',
  standardProjects: {
    [CardName.DOME_STANDARD_PROJECT]: {Factory: DomeStandardProject},
    [CardName.WILDERNESS_STANDARD_PROJECT]: {Factory: WildernessStandardProject},
  },
});
