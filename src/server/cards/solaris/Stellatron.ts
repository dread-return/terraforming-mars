import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class Stellatron extends ActionCard implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STELLATRON,
      tags: [Tag.VENUS, Tag.SPACE, Tag.GALACTIC],
      cost: 43,
      requirements: {tag: Tag.VENUS, count: 5},
      victoryPoints: {tag: Tag.GALACTIC, each: 3},

      action: {global: {venus: 1}},

      metadata: {
        cardNumber: 'S12',
        renderData: CardRenderer.builder((b) => {
          b.action('Raise Venus 1 step.', (eb) => {
            eb.empty().startAction.venus(1);
          }).br;
          b.vpText('3 VP for each Galactic tag you have, including this.');
        }),
        description: 'Requires 5 Venus tags.',
      },
    });
  }
}
