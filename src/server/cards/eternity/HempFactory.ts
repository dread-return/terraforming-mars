import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class HempFactory extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HEMP_FACTORY,
      tags: [Tag.PLANT, Tag.EARTH, Tag.BUILDING],
      cost: 11,
      victoryPoints: 1,
      behavior: {
        production: {energy: -1},
      },
      action: {
        or: {
          behaviors: [
            {title: 'Spend 2 plants to gain 8 M€ and draw a card', spend: {plants: 2}, stock: {megacredits: 8}, drawCard: 1},
            {title: 'Gain 1 plant', stock: {plants: 1}},
          ],
        },
      },
      metadata: {
        cardNumber: 'E76',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.plants(2).startAction.megacredits(8).cards(1)).br;
          b.or().br;
          b.action('Spend 2 plants for 8 M€ and a card, OR gain 1 plant.', (eb) => eb.empty().startAction.plants(1)).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Decrease your energy production 1 step.',
      },
    });
  }
}
