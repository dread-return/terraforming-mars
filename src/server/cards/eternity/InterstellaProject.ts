import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class InterstellaProject extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.INTERSTELLA_PROJECT,
      tags: [Tag.MARS, Tag.EARTH, Tag.VENUS],
      cost: 6,
      metadata: {
        cardNumber: 'EP03b',
        renderData: CardRenderer.builder((b) => {
          b.effect('Ignore any effects on cards that reduce your terraform rating.', (eb) => eb.text('IGNORE').minus().tr(1).startEffect.text('0'));
        }),
        description: 'Not shuffled into the project deck: only the Interstella prelude puts it in your hand.',
      },
    });
  }
}
