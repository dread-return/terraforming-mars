import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class IshtarOrbitingAcademy extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ISHTAR_ORBITING_ACADEMY,
      tags: [Tag.VENUS, Tag.EARTH, Tag.SPACE],
      cost: 15,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'V72',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you play a science tag, gain 2 M€.', (eb) => {
            eb.tag(Tag.SCIENCE).startEffect.megacredits(2);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.SCIENCE);
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, 2 * count, {log: true, from: {card: this}});
    }
  }
}
