import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class TechEnabledEnergyHub extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TECH_ENABLED_ENERGY_HUB,
      tags: [Tag.POWER, Tag.BUILDING, Tag.SCIENCE],
      cost: 22,
      requirements: [{tag: Tag.SCIENCE, count: 3}, {tag: Tag.POWER, count: 3}],
      victoryPoints: 2,
      behavior: {
        production: {energy: -1},
      },
      action: {
        drawCard: 3,
        stock: {energy: 2},
      },
      metadata: {
        cardNumber: 'E127',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw 3 cards and gain 2 energy.', (eb) => eb.empty().startAction.cards(3).energy(2)).br.production((pb) => pb.minus().energy(1));
        }),
        description: 'Requires 3 science and 3 power tags. Decrease your energy production 1 step.',
      },
    });
  }
}
