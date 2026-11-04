import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {TileType} from '../../../common/TileType';

export class Ecoplants extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ECOPLANTS,
      tags: [Tag.PLANT],
      cost: 10,
      victoryPoints: 1,

      behavior: {
        greeneryDiscount: 1,
      },

      metadata: {
        cardNumber: 'H62',
        renderData: CardRenderer.builder((b) => {
          b.effect('Your greenery tiles cost 1 plant less.', (eb) => {
            eb.greenery().startEffect.minus().plants(1);
          }).br;
          b.effect('Cards and standard projects that place a greenery tile cost 2 M€ less.', (eb) => {
            eb.greenery().asterix().startEffect.megacredits(-2);
          });
        }),
        description: 'Requires that you have plant production.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.production.plants >= 1;
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    if (card.behavior?.greenery !== undefined || card.tilesBuilt.includes(TileType.GREENERY)) {
      return 2;
    }
    return 0;
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    return card.name === CardName.GREENERY_STANDARD_PROJECT ? 2 : 0;
  }
}
