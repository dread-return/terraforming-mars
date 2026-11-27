// Layout of the GIGA board (GigaMarsBoard.vue): the Mars art, and the global parameter tracks drawn
// around it like the dial of the other maps, bent into an ellipse to follow the wide planet.
//
// The track art (assets/board/giga-dial.png and giga-dial-venus.png) is made from the standard dial on
// assets/board/mars.png, one cell of the standard track per cell here, using the cells this file
// computes. If the layout changes, the art has to be redrawn to match.

import {getGlobalParameterMaximums} from '@/common/boards/GlobalParameterMaximums';
import {BoardName} from '@/common/boards/BoardName';
import * as constants from '@/common/constants';

/** The whole board: the planet, its tracks and their bonuses. */
export const GIGA_BOARD_WIDTH = 1164;
export const GIGA_BOARD_HEIGHT = 730;

/** Where assets/board/giga-mars.jpg sits on the board. */
export const GIGA_MARS_LEFT = 67;
export const GIGA_MARS_TOP = 69;

/** The ellipse along the middle of the tracks. */
export const DIAL_CX = 582;
export const DIAL_CY = 352;
export const DIAL_A = 527;
export const DIAL_B = 297;

/** Width of a track, as on the standard dial. */
export const DIAL_TRACK_WIDTH = 30;

const VENUS_PITCH = 22;
/** Between the end of the oxygen (and temperature) track and the Venus track. */
const TRACK_GAP = 36;
/** Half the room at the bottom of the dial for the ocean count. */
const BOTTOM_HALF_GAP = 130;

export type DialTrackName = 'oxygen' | 'venus' | 'temperature';

export type DialPoint = {
  x: number,
  y: number,
  /** Direction pointing out of the ellipse, in degrees (0 = right, 90 = down). */
  normal: number,
};

export type DialCell = DialPoint & {
  value: number,
  /** Rotation of the marker, in degrees, so it faces the way the standard dial's markers do. */
  rotation: number,
  /** Arc length (see dialPoint) where the cell starts and ends. */
  start: number,
  end: number,
};

// Arc lengths along the ellipse, sampled finely, starting at the bottom and going clockwise (left,
// top, right), which is the direction the parametric angle t grows in with screen coordinates.
const SAMPLES = 7200;
const sampleT: Array<number> = [];
const sampleS: Array<number> = [];
{
  let s = 0;
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = Math.PI / 2 + i * 2 * Math.PI / SAMPLES;
    const x = DIAL_A * Math.cos(t);
    const y = DIAL_B * Math.sin(t);
    if (i > 0) {
      s += Math.hypot(x - prevX, y - prevY);
    }
    sampleT.push(t);
    sampleS.push(s);
    prevX = x;
    prevY = y;
  }
}

/** Length of the ellipse. */
export const DIAL_PERIMETER = sampleS[SAMPLES];

function normalize(degrees: number): number {
  let d = degrees % 360;
  if (d > 180) {
    d -= 360;
  }
  if (d <= -180) {
    d += 360;
  }
  return d;
}

/**
 * The point at arc length `s` along the ellipse, measured clockwise from its bottom.
 */
export function dialPoint(s: number, offset: number = 0): DialPoint {
  const wrapped = ((s % DIAL_PERIMETER) + DIAL_PERIMETER) % DIAL_PERIMETER;
  let lo = 0;
  let hi = SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (sampleS[mid] <= wrapped) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const f = (wrapped - sampleS[lo]) / ((sampleS[hi] - sampleS[lo]) || 1);
  const t = sampleT[lo] + f * (sampleT[hi] - sampleT[lo]);
  const nx = Math.cos(t) / DIAL_A;
  const ny = Math.sin(t) / DIAL_B;
  const len = Math.hypot(nx, ny);
  return {
    x: DIAL_CX + DIAL_A * Math.cos(t) + offset * nx / len,
    y: DIAL_CY + DIAL_B * Math.sin(t) + offset * ny / len,
    normal: normalize(Math.atan2(ny, nx) * 180 / Math.PI),
  };
}

const HALF = DIAL_PERIMETER / 2;
const VENUS_LENGTH = (constants.MAX_VENUS_SCALE_GIGA + 1) * VENUS_PITCH;
/** Length of the oxygen track, and of the temperature track mirroring it. */
const SIDE_LENGTH = HALF - VENUS_LENGTH / 2 - TRACK_GAP - BOTTOM_HALF_GAP;

/** Where each track starts and ends (arc lengths), clockwise from the bottom of the dial. */
export const DIAL_TRACK_EXTENTS: Readonly<Record<DialTrackName, {start: number, end: number}>> = {
  oxygen: {start: BOTTOM_HALF_GAP, end: BOTTOM_HALF_GAP + SIDE_LENGTH},
  venus: {start: HALF - VENUS_LENGTH / 2, end: HALF + VENUS_LENGTH / 2},
  temperature: {start: DIAL_PERIMETER - BOTTOM_HALF_GAP - SIDE_LENGTH, end: DIAL_PERIMETER - BOTTOM_HALF_GAP},
};

function trackValues(track: DialTrackName): Array<number> {
  const max = getGlobalParameterMaximums(BoardName.GIGA);
  const values: Array<number> = [];
  switch (track) {
  case 'oxygen':
    for (let v = constants.MIN_OXYGEN_LEVEL; v <= max.oxygen; v += max.oxygenStep) {
      values.push(v);
    }
    return values;
  case 'venus':
    for (let v = constants.MIN_VENUS_SCALE; v <= max.venus; v += max.venusStep) {
      values.push(v);
    }
    return values;
  case 'temperature':
    // The temperature track runs down the right side, so its warmest value comes first.
    for (let v = max.temperature; v >= constants.MIN_TEMPERATURE; v -= max.temperatureStep) {
      values.push(v);
    }
    return values;
  }
}

// The markers face the way they do on the standard dial: oxygen and temperature numbers read
// across the track, Venus numbers along it.
const ROTATION_OFFSET: Record<DialTrackName, number> = {oxygen: -180, temperature: 0, venus: 90};

/** The cells of a track, in the order they run along the dial (clockwise). */
export function dialCells(track: DialTrackName): Array<DialCell> {
  const values = trackValues(track);
  const {start, end} = DIAL_TRACK_EXTENTS[track];
  const pitch = (end - start) / values.length;
  return values.map((value, i) => {
    const cellStart = start + i * pitch;
    const point = dialPoint(cellStart + pitch / 2);
    return {
      ...point,
      value,
      rotation: normalize(point.normal + ROTATION_OFFSET[track]),
      start: cellStart,
      end: cellStart + pitch,
    };
  });
}

/** The cell holding `value` on `track`. */
export function dialCell(track: DialTrackName, value: number): DialCell {
  const cell = dialCells(track).find((c) => c.value === value);
  if (cell === undefined) {
    throw new Error(`No ${track} cell for ${value}`);
  }
  return cell;
}
