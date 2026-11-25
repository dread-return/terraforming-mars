import {CorporationCard} from '../corporation/CorporationCard';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {EpicHooks} from './EpicHooks';

export class Moar extends CorporationCard {
  constructor() {
    super({
      name: CardName.MOAR,
      tags: [Tag.WILD],
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'EP-MOR',
        description: 'You start with 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you gain resources from placing a tile on Mars, playing a project card, a global event or a colony, gain 1 more of one of them.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).cards(1).globalEvent().colonies(1).startEffect.plus().wild(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type !== CardType.EVENT && card.type !== CardType.ACTIVE && card.type !== CardType.AUTOMATED) {
      return undefined;
    }
    const stock = card.behavior?.stock;
    if (stock === undefined) {
      return undefined;
    }
    const gained = (Object.keys(stock) as Array<keyof typeof stock>).filter((key) => {
      const value = stock[key];
      return value !== undefined && (typeof value !== 'number' || value > 0);
    });
    // Unit keys and resource names are the same strings.
    EpicHooks.moarExtra(player, gained as Array<Resource>);
    return undefined;
  }
}
