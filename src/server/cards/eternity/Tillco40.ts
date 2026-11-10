import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class Tillco40 extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TILLCO_40,
      tags: [Tag.SPACE, Tag.SCIENCE],
      startingMegaCredits: 39,
      behavior: {
        production: {megacredits: 1},
        drawCard: 1,
      },
      action: {
        spend: {megacredits: 3},
        drawCard: {count: 1, tag: Tag.SCIENCE},
      },
      metadata: {
        cardNumber: 'EC22',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).megacredits(39).cards(1).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('Per science tag you play, incl. this: 1 titanium and 2 M€.', (eb) => eb.tag(Tag.SCIENCE).startEffect.titanium(1).megacredits(2));
            ce.action('Pay 3 M€ to draw a science card.', (eb) => eb.megacredits(3).startAction.cards(1, {secondaryTag: Tag.SCIENCE}));
          });
        }),
        description: 'You start with 1 M\u20ac production and 39 M\u20ac, and draw a card.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.SCIENCE).length;
    if (n > 0) {
      player.stock.add(Resource.TITANIUM, n, {log: true});
      player.stock.add(Resource.MEGACREDITS, 2 * n, {log: true});
    }
    return undefined;
  }
}
