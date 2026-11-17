import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
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
        description: 'You start with 52 M€. Reveal cards until you reveal 2 cards with plant tags. Take them into hand and discard the rest.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(52).cards(2, {secondaryTag: Tag.PLANT}).br;
          b.effect('When you play a plant tag, or the greenery standard project, you pay 3 M€ less for it.', (eb) => {
            eb.tag(Tag.PLANT).slash().greenery().asterix().startEffect.megacredits(-3);
          });
        }),
      },
    });
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    return card.name === CardName.GREENERY_STANDARD_PROJECT ? 3 : 0;
  }
}
