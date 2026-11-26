import {expect} from 'chai';
import {BoardName} from '../../src/common/boards/BoardName';
import {venusThresholds, venusTrackSpots} from '../../src/common/venusNext/VenusTrack';
import {getGlobalParameterTracks} from '../../src/server/boards/GlobalParameterTracks';

describe('VenusTrack', () => {
  it('draws the same Venus bonuses the server grants', () => {
    for (const boardName of [BoardName.THARSIS, BoardName.AMAZONIS_PLANITIA, BoardName.GIGA, BoardName.HELLAS]) {
      for (const venusPhase2Track of [false, true]) {
        const server = getGlobalParameterTracks(boardName, venusPhase2Track && boardName !== BoardName.GIGA).venus;
        expect(venusThresholds(boardName, venusPhase2Track), `${boardName} ${venusPhase2Track}`).deep.eq(server);
      }
    }
  });

  it('lists every value of the track', () => {
    expect(venusTrackSpots(BoardName.THARSIS, false, false).map((s) => s.value)).deep.eq([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
    expect(venusTrackSpots(BoardName.AMAZONIS_PLANITIA, false, false).map((s) => s.value).slice(-4)).deep.eq([30, 31, 32, 33]);
    expect(venusTrackSpots(BoardName.THARSIS, true, false)).to.have.length(25);
    expect(venusTrackSpots(BoardName.GIGA, true, false)).to.have.length(31);
  });

  it('adds the Alt. Venus board resources above 16%', () => {
    const spots = venusTrackSpots(BoardName.THARSIS, false, true);
    expect(spots.find((s) => s.value === 16)?.bonuses).deep.eq(['tr']);
    expect(spots.find((s) => s.value === 18)?.bonuses).deep.eq(['standardResource']);
    expect(spots.find((s) => s.value === 30)?.bonuses).deep.eq(['standardResource', 'wildResource']);
  });
});
