import {CardName} from '../cards/CardName';
import {Color} from '../Color';

/**
 * Mercury vs Mars (fan expansion by Aphi): shared rules data.
 *
 * Act cards are a separate deck. Two players develop an Act together (a Treaty) or against each
 * other (a Rivalry) by adding assets to its track. When the track reaches the handshake, the Act
 * resolves.
 */

/** A Treaty is cooperative (one shared track), a Rivalry competitive (one track per player). */
export type ActKind = 'treaty' | 'rivalry';

/** Every player may take part in at most this many Acts at a time. */
export const MAX_ACTS_PER_PLAYER = 2;

/** Act cards dealt to every player at setup. */
export const STARTING_TREATIES = 2;
export const STARTING_RIVALRIES = 1;

/** The Market Colonies columns. Animals are not accepted. Other non-standard resources share the last column. */
export const MARKET_RESOURCES = ['microbe', 'floater', 'data', 'other'] as const;
export type MarketResource = typeof MARKET_RESOURCES[number];
/** Each Market Colonies column saturates at this many resources. */
export const MARKET_COLUMN_CAP = 6;
/** A trade with Market Colonies takes at most this many resources of one kind (plus 1 per trade boost). */
export const MARKET_TRADE_MAX = 3;

/** Steps of the Mercury planetary track. When it reaches the last step, it is finished. */
export const MERCURY_TRACK_MAX = 13;
/** At the end of the game, the player with the most Mercury tags gets these VP, if the track is finished. */
export const MERCURY_TRACK_FINISH_VP = 2;

export type MercuryTrackReward = 'asset' | 'card' | 'standardResource' | 'act';

export type MercuryTrackSpace = {
  /** Every player gets these (the right side of the track). */
  everyone: ReadonlyArray<MercuryTrackReward>;
  /** The player who raised the track also gets these (the left side). */
  risingPlayer: ReadonlyArray<MercuryTrackReward>;
};

/** The white dots of the Mercury track and their prizes (read off the Mercury board). */
export const MERCURY_TRACK: Readonly<Partial<Record<number, MercuryTrackSpace>>> = {
  3: {everyone: ['card'], risingPlayer: ['standardResource']},
  5: {everyone: ['asset'], risingPlayer: ['asset']},
  7: {everyone: ['act', 'asset'], risingPlayer: ['asset']},
  9: {everyone: ['asset'], risingPlayer: ['card']},
  11: {everyone: ['asset'], risingPlayer: ['asset']},
  13: {everyone: ['asset'], risingPlayer: []},
};

/** One Act in development. */
export type ActDevelopmentModel = {
  card: CardName;
  kind: ActKind;
  initiator: Color;
  partner: Color;
  /** Assets needed: [initiator's track, partner's track]. A Treaty only uses the first. */
  steps: [number, number];
  /** Assets added: [initiator's track, partner's track]. */
  progress: [number, number];
};

export type MercuryModel = {
  track: number;
  /** Resources on Market Colonies, per column. */
  market: Record<MarketResource, number>;
  developments: Array<ActDevelopmentModel>;
  actDeckSize: number;
  actDiscardSize: number;
};
