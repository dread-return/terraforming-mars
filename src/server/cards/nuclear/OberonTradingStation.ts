import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class OberonTradingStation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.OBERON_TRADING_STATION,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 10,
      requirements: [{tag: Tag.SPACE, count: 3}, {tag: Tag.JOVIAN, count: 3}],
      victoryPoints: 1,
      behavior: {
        production: {steel: -1, megacredits: 4},
        colonies: {addTradeFleet: 1},
      },

      metadata: {
        cardNumber: 'N73',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().steel(1).br.plus().megacredits(4)).nbsp.tradeFleet();
        }),
        description: 'Requires 3 space tags and 3 Jovian tags. Decrease your steel production 1 step and increase your M€ production 4 steps. Gain a trade fleet.',
      },
    });
  }
}
