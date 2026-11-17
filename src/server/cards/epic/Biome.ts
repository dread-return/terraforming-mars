import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class Biome extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BIOME,
      tags: [Tag.PLANT, Tag.MICROBE, Tag.ANIMAL],
      startingMegaCredits: 50,

      metadata: {
        cardNumber: 'EP-BIO',
        description: 'You start with 50 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50).br;
          b.effect('Each time you play a plant, microbe or animal tag, collect 2 M€ per tag on that card.', (eb) => {
            eb.tag(Tag.PLANT).tag(Tag.MICROBE).tag(Tag.ANIMAL).startEffect.megacredits(2);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    const count = player.tags.cardTagCount(card, [Tag.PLANT, Tag.MICROBE, Tag.ANIMAL]);
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, 2 * count, {log: true, from: {card: this}});
    }
  }
}
