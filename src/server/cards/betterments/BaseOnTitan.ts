import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class BaseOnTitan extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BASE_ON_TITAN,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 25,
      requirements: {tag: Tag.JOVIAN, count: 3},
      victoryPoints: {tag: Tag.JOVIAN},

      action: {
        spend: {titanium: 2},
        tr: 1,
      },

      metadata: {
        cardNumber: 'B49',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 titanium to raise your TR 1 step.', (eb) => {
            eb.titanium(2).startAction.tr(1);
          }).br;
          b.vpText('1 VP per Jovian tag you have.');
        }),
        description: 'Requires 3 Jovian tags.',
      },
    });
  }
}
