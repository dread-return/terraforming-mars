import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class ShieldingDrones extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SHIELDING_DRONES,
      tags: [Tag.SPACE],
      cost: 11,
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}, per: 5},

      metadata: {
        cardNumber: 'S46',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a space, building or science tag, including this, add 1 fighter to this card.', (eb) => {
            eb.tag(Tag.SPACE).slash().tag(Tag.BUILDING).slash().tag(Tag.SCIENCE).startEffect.resource(CardResource.FIGHTER);
          }).br;
          b.vpText('1 VP for every 5 fighters on this card.');
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    // Its own space tag counts too.
    const count = player.tags.cardTagCount(card, [Tag.SPACE, Tag.BUILDING, Tag.SCIENCE]);
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
