import {SpaceId} from '@/common/Types';
import {SpaceName} from '@/common/boards/SpaceName';

// The off-Mars spaces orbit the planet: four arcs (one per corner) that follow the outside of the tracks, as on the
// printed round maps. Each arc lists its slots from the end nearest the middle of the board outwards, by centre point,
// and the spaces that go there in that order. Spaces fill an arc from that end, so a corner with fewer spaces in this
// game keeps them close to the tracks instead of leaving gaps.
type Point = {x: number, y: number};
type Arc = {slots: ReadonlyArray<Point>, spaces: ReadonlyArray<SpaceId>};

const ARC_TOP_LEFT: Arc = {
  slots: [{x: 222, y: 58}, {x: 152, y: 92}, {x: 92, y: 140}, {x: 38, y: 208}],
  spaces: [SpaceName.STANFORD_TORUS, SpaceName.PHOBOS_SPACE_HAVEN, SpaceName.GANYMEDE_COLONY, SpaceName.MAIN_DOCKING_STATION],
};
const ARC_BOTTOM_LEFT: Arc = {
  slots: [{x: 215, y: 700}, {x: 118, y: 640}, {x: 45, y: 572}],
  spaces: [SpaceName.SPACE_SOLARIUM, SpaceName.FLYING_GARDEN, SpaceName.SIDERALIS],
};
const ARC_TOP_RIGHT: Arc = {
  slots: [{x: 942, y: 58}, {x: 1012, y: 92}, {x: 1072, y: 140}, {x: 1126, y: 208}],
  spaces: [SpaceName.STRATOPOLIS, SpaceName.DAWN_CITY, SpaceName.LUNA_METROPOLIS, SpaceName.MAXWELL_BASE, SpaceName.SIDERALIS],
};
const ARC_BOTTOM_RIGHT: Arc = {
  slots: [{x: 949, y: 700}, {x: 1046, y: 640}, {x: 1119, y: 572}],
  spaces: [SpaceName.LUNAR_EMBASSY, SpaceName.DYSON_SCREENS, SpaceName.CERES_SPACEPORT],
};
const ARCS = [ARC_TOP_LEFT, ARC_BOTTOM_LEFT, ARC_TOP_RIGHT, ARC_BOTTOM_RIGHT];

// Venera Base keeps its place at the end of the Venus track, as on the printed maps.
const VENERA_BASE_SLOT: Point = {x: 849, y: 53};

const SPACE_HALF_WIDTH = 23;
const SPACE_HALF_HEIGHT = 25;

/** Where each off-Mars space on this board goes, as the top left corner of its hex. */
export function offMarsSlots(ids: ReadonlyArray<SpaceId>): Map<SpaceId, {left: number, top: number}> {
  const present = new Set(ids);
  const centres = new Map<SpaceId, Point>();
  if (present.has(SpaceName.VENERA_BASE)) {
    centres.set(SpaceName.VENERA_BASE, VENERA_BASE_SLOT);
  }
  // Sideralis sits under Luna Metropolis, unless Maxwell Base takes that spot; then it goes bottom left.
  const sideralisRight = !present.has(SpaceName.MAXWELL_BASE);
  for (const arc of ARCS) {
    const spaces = arc.spaces.filter((id) => present.has(id) && !centres.has(id) &&
      (id !== SpaceName.SIDERALIS || sideralisRight === (arc === ARC_TOP_RIGHT)));
    spaces.slice(0, arc.slots.length).forEach((id, i) => centres.set(id, arc.slots[i]));
  }
  const slots = new Map<SpaceId, {left: number, top: number}>();
  for (const [id, centre] of centres) {
    slots.set(id, {left: centre.x - SPACE_HALF_WIDTH, top: centre.y - SPACE_HALF_HEIGHT});
  }
  return slots;
}
