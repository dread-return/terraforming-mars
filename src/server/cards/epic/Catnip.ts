import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class Catnip extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CATNIP,
      tags: [Tag.BUILDING],
      startingMegaCredits: 38,
      behavior: {
        stock: {steel: 8},
      },

      metadata: {
        cardNumber: 'EP-CAT',
        description: 'You start with 38 M€ and 8 steel.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).steel(8).br;
          b.effect('When you play a building tag, including this, gain 1 plant.', (eb) => {
            eb.tag(Tag.BUILDING).startEffect.plants(1);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, Tag.BUILDING);
    if (count > 0) {
      player.stock.add(Resource.PLANTS, count, {log: true, from: {card: this}});
    }
  }
}
