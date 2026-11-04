import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class AlgorithmicTrading extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ALGORITHMIC_TRADING,
      tags: [Tag.SCIENCE, Tag.EARTH],
      cost: 20,
      requirements: {tag: Tag.SCIENCE},
      victoryPoints: 2,

      behavior: {
        production: {megacredits: 2},
      },

      action: {
        spend: {megacredits: 8},
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'H61',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 8 M€ to increase your M€ production 2 steps.', (eb) => {
            eb.megacredits(8).startAction.production((pb) => pb.megacredits(2));
          }).br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Requires a science tag. Increase your M€ production 2 steps.',
      },
    });
  }
}
