import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

/**
 * Ore here is worth 1 titanium when buying an infrastructure (HighOrbit.buy asks how much to use) and 3 M€ for
 * the Build Colony standard project (the `shipyardOre` payment unit).
 */
export class OrbitalShipyard extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.ORBITAL_SHIPYARD, copy, {
      resourceType: CardResource.ORE,
      action: {
        addResourcesToAnyCard: {type: CardResource.ORE, count: 1},
      },
      metadata: {
        cardNumber: 'INF11',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 ore to any card.', (eb) => eb.empty().startAction.resource(CardResource.ORE).asterix()).br;
          b.effect('Ore here is worth 1 titanium when paying for infrastructures, or 3 M€ when paying for colonies.', (eb) => {
            eb.tag(Tag.INFRASTRUCTURE).slash().colonies(1).startEffect.resource(CardResource.ORE).equals().titanium(1).slash().megacredits(3);
          });
        }),
      },
    });
  }
}
