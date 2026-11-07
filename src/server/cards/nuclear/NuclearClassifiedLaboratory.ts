import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

/** Paying for science cards with titanium is handled by Nuclear.canUseTitanium and Nuclear.onProjectCardPaid. */
export class NuclearClassifiedLaboratory extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.NUCLEAR_CLASSIFIED_LABORATORY,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.SPACE],
      cost: 33,
      requirements: {tr: 27},
      victoryPoints: 2,
      // The icon shows a space-tag discount; the card text says science tags. Following the icon.
      cardDiscount: {tag: Tag.SPACE, amount: 1},
      behavior: {tr: 1},

      metadata: {
        cardNumber: 'N45',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may use titanium to pay for science cards. If you pay a science card only with titanium, add a radiation to ANY card.', (eb) => {
            eb.tag(Tag.SCIENCE).colon().startEffect.titanium(1).nbsp.resource(CardResource.RADIATION).asterix();
          }).br;
          b.effect('When you play a space tag, you pay 1 M€ less.', (eb) => {
            eb.tag(Tag.SPACE).startEffect.megacredits(-1);
          }).br;
          b.tr(1);
        }),
        description: 'Requires 27 TR. Raise your TR 1 step.',
      },
    });
  }
}
