import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class SyntheticGargantuaTrees extends ActionCard implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SYNTHETIC_GARGANTUA_TREES,
      tags: [Tag.PLANT, Tag.SPACE, Tag.GALACTIC],
      cost: 68,
      requirements: {tag: Tag.PLANT, count: 5},
      victoryPoints: {tag: Tag.GALACTIC, each: 3},

      action: {greenery: {}},

      metadata: {
        cardNumber: 'S07',
        renderData: CardRenderer.builder((b) => {
          b.action('Place a greenery tile and raise the oxygen 1 step.', (eb) => {
            eb.empty().startAction.greenery();
          }).br;
          b.vpText('3 VP for each Galactic tag you have, including this.');
        }),
        description: 'Requires 5 plant tags.',
      },
    });
  }
}
