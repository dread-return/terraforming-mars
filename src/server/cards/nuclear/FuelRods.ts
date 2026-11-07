import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class FuelRods extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FUEL_RODS,
      tags: [Tag.RADIOACTIVE, Tag.POWER],
      cost: 17,
      requirements: {temperature: -18},
      behavior: {production: {energy: 1}},

      action: {
        or: {
          behaviors: [
            {title: 'Gain 1 heat and add a radiation to ANY card', stock: {heat: 1}, addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},
            {title: 'Spend 1 heat to gain 3 M€', spend: {heat: 1}, stock: {megacredits: 3}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N07',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 1 heat and add a radiation to ANY card.', (eb) => {
            eb.empty().startAction.heat(1).resource(CardResource.RADIATION).asterix();
          }).br;
          b.or().br;
          b.action('Spend 1 heat to gain 3 M€.', (eb) => {
            eb.heat(1).startAction.megacredits(3);
          }).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Requires -18 °C or warmer. Increase your energy production 1 step.',
      },
    });
  }
}
