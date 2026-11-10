import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class CASHCo extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CASH_CO,
      tags: [Tag.POWER, Tag.SCIENCE],
      startingMegaCredits: 29,
      behavior: {
        production: {energy: 2},
      },
      firstAction: {
        text: 'Draw 2 science cards',
        drawCard: {count: 2, tag: Tag.SCIENCE},
      },
      metadata: {
        cardNumber: 'EC09',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(29).production((pb) => pb.energy(2)).cards(2, {secondaryTag: Tag.SCIENCE}).br;
          b.corpBox('effect', (ce) => ce.effect('When playing a power or science card, you pay 1 M€ less for it.', (eb) => eb.tag(Tag.SCIENCE).slash().tag(Tag.POWER).startEffect.megacredits(-1)));
        }),
        description: 'You start with 29 M\u20ac and 2 energy production. First action: draw 2 science cards.',
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard): number {
    return (card.tags.includes(Tag.POWER) || card.tags.includes(Tag.SCIENCE)) ? 1 : 0;
  }
}
