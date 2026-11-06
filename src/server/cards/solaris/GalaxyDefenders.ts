import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class GalaxyDefenders extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GALAXY_DEFENDERS,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 17,
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}},

      metadata: {
        cardNumber: 'S43',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Jovian tag, including this, gain 1 M€ and add 1 fighter to this card.', (eb) => {
            eb.tag(Tag.JOVIAN).startEffect.megacredits(1).resource(CardResource.FIGHTER);
          }).br;
          b.vpText('1 VP for each fighter on this card.');
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.JOVIAN);
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, count, {log: true});
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
