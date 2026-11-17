import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class Fractal extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.FRACTAL,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'EP-FRA',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).br;
          b.effect('After you play a space or Jovian tag, gain 1 plant. After you play a plant or microbe tag, gain 1 titanium.', (eb) => {
            eb.tag(Tag.SPACE).tag(Tag.JOVIAN).colon().plants(1).nbsp.tag(Tag.PLANT).tag(Tag.MICROBE).startEffect.titanium(1);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const plants = player.tags.cardTagCount(card, [Tag.SPACE, Tag.JOVIAN]);
    const titanium = player.tags.cardTagCount(card, [Tag.PLANT, Tag.MICROBE]);
    if (plants > 0) {
      player.stock.add(Resource.PLANTS, plants, {log: true, from: {card: this}});
    }
    if (titanium > 0) {
      player.stock.add(Resource.TITANIUM, titanium, {log: true, from: {card: this}});
    }
  }
}
