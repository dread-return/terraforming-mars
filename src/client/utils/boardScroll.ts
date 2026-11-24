import {SpaceId} from '@/common/Types';
import {MERCURY_SPACE_IDS} from '@/common/mercury/Mercury';

// Scrolls the Mars, Moon or Mercury board into view depending on which board `spaceId` belongs to.
// Returns the scrolled-to element, or null if it isn't present (e.g. no board on this screen).
export function scrollToSpace(spaceId: SpaceId): HTMLElement | null {
  const id = MERCURY_SPACE_IDS.includes(spaceId) ? 'mercury_board' : spaceId.startsWith('m') ? 'shortkey-moonBoard' : 'shortkey-board';
  const el = document.getElementById(id);
  el?.scrollIntoView({block: 'center', inline: 'center', behavior: 'auto'});
  return el;
}
