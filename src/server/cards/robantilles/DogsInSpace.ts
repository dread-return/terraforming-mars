import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';

export class DogsInSpace extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.DOGS_IN_SPACE,
      tags: [Tag.ANIMAL, Tag.SPACE],
      cost: 16,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'H22',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a space tag, including this, add 1 animal to this card.', (eb) => {
            eb.tag(Tag.SPACE).startEffect.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('1 VP per 2 animals on this card.');
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.SPACE);
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
