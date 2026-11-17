import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class AstroBiotics extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ASTRO_BIOTICS,
      tags: [Tag.PLANT],
      startingMegaCredits: 52,
      cardDiscount: {tag: Tag.PLANT, amount: 3},

      behavior: {
        drawCard: {count: 2, tag: Tag.PLANT},
      },

      metadata: {
        cardNumber: 'EP-ASB',
        description: 'You start with 52 M€. Reveal cards until 2 plant tags, and take them.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(52).cards(2, {secondaryTag: Tag.PLANT});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play a plant tag, or the GREENERY standard project, you pay 3 M€ less for it.', (eb) => {
              eb.tag(Tag.PLANT).slash().plate('Greenery').startEffect.megacredits(-3);
            });
          });
        }),
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    return card.name === CardName.GREENERY_STANDARD_PROJECT ? 3 : 0;
  }
}
