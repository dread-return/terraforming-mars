import {expect} from 'chai';
import {DIAL_CX, DIAL_TRACK_EXTENTS, GIGA_BOARD_HEIGHT, GIGA_BOARD_WIDTH, dialCell, dialCells, dialPoint} from '@/client/components/board/gigaDial';

describe('gigaDial', () => {
  it('starts at the bottom of the dial and goes clockwise', () => {
    const bottom = dialPoint(0);
    expect(bottom.x).to.be.closeTo(DIAL_CX, 0.01);
    expect(bottom.normal).to.be.closeTo(90, 0.01);
    // A quarter of the way round is the left side.
    expect(dialPoint(DIAL_TRACK_EXTENTS.venus.start / 2 + DIAL_TRACK_EXTENTS.venus.end / 2).normal).to.be.closeTo(-90, 0.01);
  });

  it('lays the tracks out in order, without overlapping, inside the board', () => {
    const {oxygen, venus, temperature} = DIAL_TRACK_EXTENTS;
    expect(oxygen.end).lt(venus.start);
    expect(venus.end).lt(temperature.start);
    for (const track of ['oxygen', 'venus', 'temperature'] as const) {
      for (const cell of dialCells(track)) {
        expect(cell.x).within(20, GIGA_BOARD_WIDTH - 20);
        expect(cell.y).within(20, GIGA_BOARD_HEIGHT - 20);
      }
    }
  });

  it('mirrors oxygen and temperature', () => {
    const oxygen = dialPoint(DIAL_TRACK_EXTENTS.oxygen.start);
    const temperature = dialPoint(DIAL_TRACK_EXTENTS.temperature.end);
    expect(oxygen.x + temperature.x).to.be.closeTo(2 * DIAL_CX, 0.1);
    expect(oxygen.y).to.be.closeTo(temperature.y, 0.1);
    // Markers read across the side tracks and along the Venus track.
    expect(dialCell('oxygen', 10).rotation).to.be.closeTo(0, 25);
    expect(dialCell('temperature', -6).rotation).to.be.closeTo(0, 25);
    expect(dialCell('venus', 15).rotation).to.be.closeTo(0, 1);
  });
});
