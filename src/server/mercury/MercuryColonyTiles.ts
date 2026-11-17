import {ColonyBenefit} from '../../common/colonies/ColonyBenefit';
import {ColonyName} from '../../common/colonies/ColonyName';
import {Colony} from '../colonies/Colony';

// Mercury vs Mars colony tiles. Kept apart from MercuryColonies.ts, which Colony.ts imports.

/** Market Colonies: always in play with Mercury vs Mars. Trading takes resources players put on the market. */
export class MarketColonies extends Colony {
  constructor() {
    super({
      name: ColonyName.MARKET_COLONIES,
      build: {
        description: 'Gain 3 of the same standard resource',
        type: ColonyBenefit.GAIN_SAME_STANDARD_RESOURCES,
        quantity: [3, 3, 3, 3],
      },
      trade: {
        description: 'Take up to 3 resources of one kind from the market (1 more per trade boost)',
        type: ColonyBenefit.MARKET_TRADE,
      },
      colony: {
        description: 'Gain 1 asset',
        type: ColonyBenefit.GAIN_ASSETS,
        quantity: 1,
      },
      expansion: 'mercury',
      shouldIncreaseTrack: 'no',
      colonySpaces: 4,
    });
  }
}

/** Shadow Colonies: one of the random colonies. Its tile sits on the Mercury board. */
export class ShadowColonies extends Colony {
  constructor() {
    super({
      name: ColonyName.SHADOW_COLONIES,
      build: {
        description: 'Gain 3 assets',
        type: ColonyBenefit.GAIN_ASSETS,
        quantity: [3, 3, 3, 3],
      },
      trade: {
        description: 'Gain assets',
        type: ColonyBenefit.GAIN_ASSETS,
        quantity: [1, 1, 2, 2, 3, 3, 4, 5],
      },
      colony: {
        description: 'Gain 1 asset',
        type: ColonyBenefit.GAIN_ASSETS,
        quantity: 1,
      },
      expansion: 'mercury',
      maxTrackPosition: 7,
      colonySpaces: 4,
    });
  }
}

/** The Asteroid Belt: one of the random colonies. */
export class AsteroidBelt extends Colony {
  constructor() {
    super({
      name: ColonyName.ASTEROID_BELT,
      build: {
        description: 'Raise Venus 1 step or add 1 asteroid to a card',
        type: ColonyBenefit.VENUS_STEP_OR_ASTEROID,
      },
      trade: {
        description: '1 / 2 standard resources, 1 steel production, 1 asteroid, 1 asteroid + 1 titanium, 1 asteroid + 1 resource to any card, 2 asteroids + 1 resource to any card',
        type: ColonyBenefit.ASTEROID_BELT_TRADE,
      },
      colony: {
        description: 'Gain 1 standard resource',
        type: ColonyBenefit.GAIN_STANDARD_RESOURCE,
        quantity: 1,
      },
      expansion: 'mercury',
      shouldIncreaseTrack: 'ask',
    });
  }
}
