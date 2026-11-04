import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

export class InterplanetaryAdvertisingNetwork extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INTERPLANETARY_ADVERTISING_NETWORK,
      tags: [Tag.MARS, Tag.EARTH],
      cost: 33,
      victoryPoints: 2,

      behavior: {
        tr: {cities: {where: 'onmars'}, all: false},
      },

      metadata: {
        cardNumber: 'B09',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).slash().city();
        }),
        description: 'Raise your TR 1 step for each city you own on Mars.',
      },
    });
  }
}
