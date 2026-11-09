import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class SyntheticBiology extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SYNTHETIC_BIOLOGY,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      cost: 12,

      metadata: {
        cardNumber: 'V54',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you add a microbe to a card, gain 1 M€ per microbe.', (eb) => {
            eb.resource(CardResource.MICROBE).startEffect.megacredits(1);
          });
        }),
      },
    });
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard, count: number) {
    if (playedCard.resourceType === CardResource.MICROBE) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true, from: {card: this}});
    }
  }
}
