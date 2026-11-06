import {Tag} from '../../../common/cards/Tag';
import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class Omegalaxy extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OMEGALAXY,
      tags: [Tag.SPACE, Tag.GALACTIC],
      startingMegaCredits: 55,

      cardDiscount: [
        {tag: Tag.SPACE, amount: 1, per: 'tag'},
        {tag: Tag.JOVIAN, amount: 3, per: 'tag'},
        {tag: Tag.GALACTIC, amount: 5, per: 'tag'},
      ],
      metadata: {
        cardNumber: 'S00',
        description: 'You start with 55 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(55);
          b.corpBox('effect', (ce) => {
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.SPACE).slash().tag(Tag.JOVIAN).startEffect.megacredits(-1).slash().megacredits(-3);
            });
            ce.vSpace();
            ce.effect('When you play a space, Jovian or Galactic tag, you pay 1 M€, 3 M€ or 5 M€ less for each, respectively.', (eb) => {
              eb.tag(Tag.GALACTIC).startEffect.megacredits(-5);
            });
          });
        }),
      },
    });
  }
}
