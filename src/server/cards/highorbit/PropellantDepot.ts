import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {InfrastructureActionCard} from './InfrastructureCard';

/** Ore here pays 2 M€ each for cards with a planetary tag (the `propellantOre` payment unit; see HighOrbit). */
export class PropellantDepot extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.PROPELLANT_DEPOT, copy, {
      resourceType: CardResource.ORE,
      action: {
        spend: {energy: 1},
        addResourcesToAnyCard: {type: CardResource.ORE, count: 2},
      },
      metadata: {
        cardNumber: 'INF12',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to add 2 ore to any card.', (eb) => eb.energy(1).startAction.resource(CardResource.ORE, {amount: 2, digit}).asterix()).br;
          b.effect('Ore here is worth 2 M€ when paying for a card with a planetary tag (Earth, Venus, Mars, Jovian, Moon, Mercury).', (eb) => {
            eb.text('planet tag').startEffect.resource(CardResource.ORE).equals().megacredits(2);
          });
        }),
      },
    });
  }
}
