import {IndividualTrackName} from '@/common/individualTracks/IndividualTracks';

/** A player's markers on the individual global parameter tracks. */
export type IndividualTracksPlayerModel = {
  /** The step each marker is on. 0 is the start, before the first step. */
  positions: Record<IndividualTrackName, number>,
  /** Extra milestone claims or award fundings earned and not yet used. */
  extraClaims: number,
  /** True while the card being played has already moved the cities marker, so a city it places does not move it again. */
  cityCreditedByCard?: boolean,
}
