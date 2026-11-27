import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class Genecraft extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GENECRAFT,
      tags: [Tag.MICROBE],
      startingMegaCredits: 30,
      cardDiscount: {tag: Tag.MICROBE, per: 'card', amount: 2},

      firstAction: {
        text: 'Reveal cards until you reveal one with a microbe tag, and take it',
        drawCard: {count: 1, tag: Tag.MICROBE},
      },

      metadata: {
        cardNumber: 'EP-GEN',
        description: 'You start with 30 M€. First action: reveal cards until a microbe tag, and take it.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(30).cards(1, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.resource(CardResource.MICROBE).asterix().startEffect.plus().resource(CardResource.MICROBE);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('When you add microbes to a card, add 1 more microbe there (not with this effect). Your microbe cards cost 2 M€ less.', (eb) => {
              eb.tag(Tag.MICROBE).startEffect.megacredits(-2);
            });
          });
        }),
      },
    });
  }
  // The extra microbe is in Player.addResourceTo.
}
