import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class TerraformingControlStationE extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TERRAFORMING_CONTROL_STATION_E,
      tags: [Tag.MARS, Tag.VENUS, Tag.SPACE],
      cost: 20,
      behavior: {
        tr: 2,
      },
      metadata: {
        cardNumber: 'E128',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Venus or Mars tag, pay 2 M€ less.', (eb) => eb.tag(Tag.VENUS).slash().tag(Tag.MARS).startEffect.megacredits(-2)).br.tr(2);
        }),
        description: 'Raise your TR 2 steps.',
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard): number {
    return (card.tags.includes(Tag.VENUS) || card.tags.includes(Tag.MARS)) ? 2 : 0;
  }
}
