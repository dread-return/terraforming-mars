import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class BioProductTestingLaboratory extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BIO_PRODUCT_TESTING_LABORATORY,
      tags: [Tag.SCIENCE, Tag.POWER, Tag.PLANT],
      cost: 27,
      requirements: [{tag: Tag.SCIENCE}, {tag: Tag.POWER}, {tag: Tag.PLANT}],
      victoryPoints: 2,
      cardDiscount: [{tag: Tag.SCIENCE, amount: 3, per: 'tag'}, {tag: Tag.POWER, amount: 3, per: 'tag'}, {tag: Tag.PLANT, amount: 3, per: 'tag'}],
      metadata: {
        cardNumber: 'E49',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a card, pay 3 M€ less for each science, power or plant tag on it.', (eb) => eb.tag(Tag.SCIENCE).slash().tag(Tag.POWER).slash().tag(Tag.PLANT).startEffect.megacredits(-3));
        }),
        description: 'Requires a science tag, a power tag and a plant tag.',
      },
    });
  }
}
