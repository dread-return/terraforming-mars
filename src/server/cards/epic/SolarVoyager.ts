import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

export class SolarVoyager extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SOLAR_VOYAGER,
      tags: [Tag.VENUS, Tag.MERCURY, Tag.JOVIAN],
      startingMegaCredits: 43,
      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-SOV',
        description: 'You start with 43 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(43).production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play a Venus, Mercury or Jovian tag, including these, gain 2 M€.', (eb) => {
              eb.tag(Tag.VENUS).tag(Tag.MERCURY).tag(Tag.JOVIAN).startEffect.megacredits(2);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, [Tag.VENUS, Tag.MERCURY, Tag.JOVIAN]);
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, 2 * count, {log: true, from: {card: this}});
    }
  }
}
