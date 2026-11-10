import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MATT38 extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MATT_38,
      tags: [Tag.BUILDING, Tag.EARTH],
      cost: 11,
      requirements: {tag: Tag.MARS, count: 2},
      behavior: {
        production: {energy: -1, megacredits: 1},
      },
      action: {
        or: {
          behaviors: [
            {title: 'Increase your M€ production 1 step', production: {megacredits: 1}},
            {title: 'Decrease your M€ production 3 steps to gain 3 M€ and increase your plant production 1 step', production: {megacredits: -3, plants: 1}, stock: {megacredits: 3}},
          ],
        },
      },
      metadata: {
        cardNumber: 'E22',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.empty().startAction.production((pb) => pb.megacredits(1))).br;
          b.action('Or: -3 M€ prod. for 3 M€, +1 plant prod.', (eb) => eb.production((pb) => pb.megacredits(-3)).startAction.megacredits(3).production((pb) => pb.plants(1))).br;
          b.production((pb) => pb.minus().energy(1).plus().megacredits(1));
        }),
      },
    });
  }
}
