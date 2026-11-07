import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class ProcessedTitanium extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PROCESSED_TITANIUM,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 8,
      requirements: {tag: Tag.SCIENCE, count: 4},
      victoryPoints: 1,
      behavior: {production: {megacredits: 2}},

      action: {
        or: {
          behaviors: [
            {title: 'Decrease your M€ production 2 steps to increase your steel production 1 step', production: {megacredits: -2, steel: 1}},
            {title: 'Decrease your M€ production 2 steps to increase your titanium production 1 step', production: {megacredits: -2, titanium: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N74',
        renderData: CardRenderer.builder((b) => {
          b.action('Decrease your M€ production 2 steps to increase your steel or titanium production 1 step.', (eb) => {
            eb.production((pb) => pb.megacredits(2)).startAction.production((pb) => pb.steel(1).slash().titanium(1));
          }).br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Requires 4 science tags. Increase your M€ production 2 steps.',
      },
    });
  }
}
