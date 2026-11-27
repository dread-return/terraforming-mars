import {SpaceId} from '@/common/Types';
import {SpaceName} from '@/common/boards/SpaceName';

// The off-Mars spaces orbit the planet: four arcs (one per corner) that follow the outside of the tracks, as on the
// printed round maps. Each arc lists its slots in the order they fill, by centre point, and the spaces that go there in
// that order. The top arcs fill from the end nearest the middle of the board; the bottom ones from their middle-most
// regular slot outwards, with one spare slot further in, so a corner with fewer spaces keeps them close to the tracks.
//
// Spaces that don't fit their top arc spill into the bottom arc on the same side (after its own spaces). Which spaces
// are on the board depends on the game: with Venus Phase 2, Stratopolis, Maxwell Base, Dyson Screens and Venera Base
// go on the Venus map instead (VENUS_MAP_CITY_SPACES), and the others close up.
type Point = {x: number, y: number};
type Arc = {slots: ReadonlyArray<Point>, spaces: ReadonlyArray<SpaceId>};

const ARC_TOP_LEFT: Arc = {
  slots: [{x: 222, y: 58}, {x: 152, y: 92}, {x: 92, y: 140}, {x: 38, y: 208}],
  spaces: [SpaceName.STANFORD_TORUS, SpaceName.PHOBOS_SPACE_HAVEN, SpaceName.GANYMEDE_COLONY, SpaceName.MAIN_DOCKING_STATION],
};
const ARC_BOTTOM_LEFT: Arc = {
  slots: [{x: 215, y: 700}, {x: 118, y: 640}, {x: 45, y: 572}, {x: 284, y: 724}],
  spaces: [SpaceName.SPACE_SOLARIUM, SpaceName.FLYING_GARDEN, SpaceName.SIDERALIS],
};
// Venera Base leads, next to the end of the Venus track.
const ARC_TOP_RIGHT: Arc = {
  slots: [{x: 942, y: 58}, {x: 1012, y: 92}, {x: 1072, y: 140}, {x: 1126, y: 208}],
  spaces: [SpaceName.VENERA_BASE, SpaceName.STRATOPOLIS, SpaceName.DAWN_CITY, SpaceName.LUNA_METROPOLIS, SpaceName.MAXWELL_BASE, SpaceName.SIDERALIS],
};
const ARC_BOTTOM_RIGHT: Arc = {
  slots: [{x: 949, y: 700}, {x: 1046, y: 640}, {x: 1119, y: 572}, {x: 880, y: 724}],
  spaces: [SpaceName.LUNAR_EMBASSY, SpaceName.DYSON_SCREENS, SpaceName.CERES_SPACEPORT],
};

const SPACE_HALF_WIDTH = 23;
const SPACE_HALF_HEIGHT = 25;

/** Where each off-Mars space on this board goes, as the top left corner of its hex. */
export function offMarsSlots(ids: ReadonlyArray<SpaceId>): Map<SpaceId, {left: number, top: number}> {
  const present = new Set(ids);
  const inArc = (arc: Arc) => arc.spaces.filter((id) => present.has(id));

  // Sideralis goes top right (after Luna Metropolis) while there's room there, else bottom left.
  const topRight: Array<SpaceId> = inArc(ARC_TOP_RIGHT).filter((id) => id !== SpaceName.SIDERALIS);
  const sideralisRight = topRight.length < ARC_TOP_RIGHT.slots.length;
  const bottomLeft = inArc(ARC_BOTTOM_LEFT).filter((id) => id !== SpaceName.SIDERALIS || !sideralisRight);
  if (sideralisRight && present.has(SpaceName.SIDERALIS)) {
    topRight.push(SpaceName.SIDERALIS);
  }

  const centres = new Map<SpaceId, Point>();
  const side = (top: Arc, topSpaces: ReadonlyArray<SpaceId>, bottom: Arc, bottomSpaces: ReadonlyArray<SpaceId>) => {
    const n = top.slots.length;
    topSpaces.slice(0, n).forEach((id, i) => centres.set(id, top.slots[i]));
    // Anything left over goes to the row under the board.
    [...bottomSpaces, ...topSpaces.slice(n)].slice(0, bottom.slots.length).forEach((id, i) => centres.set(id, bottom.slots[i]));
  };
  side(ARC_TOP_LEFT, inArc(ARC_TOP_LEFT), ARC_BOTTOM_LEFT, bottomLeft);
  side(ARC_TOP_RIGHT, topRight, ARC_BOTTOM_RIGHT, inArc(ARC_BOTTOM_RIGHT));

  const slots = new Map<SpaceId, {left: number, top: number}>();
  for (const [id, centre] of centres) {
    slots.set(id, {left: centre.x - SPACE_HALF_WIDTH, top: centre.y - SPACE_HALF_HEIGHT});
  }
  return slots;
}
