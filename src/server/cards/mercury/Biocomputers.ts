import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';

export class Biocomputers extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.BIOCOMPUTERS,
      type: CardType.ACTIVE,
      tags: [Tag.MICROBE, Tag.MERCURY],
      cost: 12,
      requirements: {tag: Tag.SCIENCE, count: 3},
      behavior: {
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 2},
      },
      metadata: {
        cardNumber: 'MM05',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a building tag, a science tag or a Mercury tag, you pay 2 M€ less.', (eb) => {
            eb.tag(Tag.BUILDING).slash().tag(Tag.SCIENCE).slash().tag(Tag.MERCURY).startEffect.megacredits(-2);
          }).br;
          b.resource(CardResource.MICROBE, 2).asterix();
        }),
        description: 'Requires 3 science tags. Add 2 microbes to any card.',
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return card.tags.some((tag) => tag === Tag.BUILDING || tag === Tag.SCIENCE || tag === Tag.MERCURY) ? 2 : 0;
  }
}
