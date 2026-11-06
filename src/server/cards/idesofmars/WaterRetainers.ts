import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {TileType} from '../../../common/TileType';

export class WaterRetainers extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.WATER_RETAINERS,
      tags: [Tag.SCIENCE],
      cost: 19,

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'I56',
        renderData: CardRenderer.builder((b) => {
          b.effect('Cards and standard projects placing a greenery cost 2 M€ less; placing an ocean, 3 M€ less.', (eb) => {
            eb.greenery().asterix().colon().megacredits(-2).nbsp.oceans(1).asterix().startEffect.megacredits(-3);
          }).br;
          b.production((pb) => pb.plants(1));
        }),
        description: 'Increase your plant production 1 step.',
      },
    });
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    let discount = 0;
    if (card.behavior?.greenery !== undefined || card.tilesBuilt.includes(TileType.GREENERY)) {
      discount += 2;
    }
    if (card.behavior?.ocean !== undefined || card.tilesBuilt.includes(TileType.OCEAN)) {
      discount += 3;
    }
    return discount;
  }

  public getStandardProjectDiscount(_player: IPlayer, card: IStandardProjectCard): number {
    if (card.name === CardName.GREENERY_STANDARD_PROJECT) {
      return 2;
    }
    if (card.name === CardName.AQUIFER_STANDARD_PROJECT) {
      return 3;
    }
    return 0;
  }
}
