import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {InfrastructureActionCard} from './InfrastructureCard';

/** Ore here pays 2 M€ each for cards with a Venus, Moon or Jovian tag (the `propellantOre` payment unit). */
export class PropellantDepot extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.PROPELLANT_DEPOT, copy, {
      resourceType: CardResource.ORE,
      action: {
        spend: {energy: 1},
        addResourcesToAnyCard: {type: CardResource.ORE, count: 1},
      },
      metadata: {
        cardNumber: 'HO12',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 energy to add 1 ore to any card.', (eb) => eb.energy(1).startAction.resource(CardResource.ORE).asterix()).br;
          b.effect('Ore here may be used as 2 M€ each to pay for cards with a Venus, Moon or Jovian tag.', (eb) => {
            eb.tag(Tag.VENUS).slash().tag(Tag.MOON).slash().tag(Tag.JOVIAN).startEffect.resource(CardResource.ORE).equals().megacredits(2);
          });
        }),
      },
    });
  }
}
