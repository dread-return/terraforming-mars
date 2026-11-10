import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class ToxicBiometalBacteria extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TOXIC_BIOMETAL_BACTERIA,
      tags: [Tag.MICROBE],
      cost: 10,
      requirements: {oceans: 1},
      behavior: {
        production: {titanium: 1, plants: 1},
        tr: -1,
      },
      metadata: {
        cardNumber: 'E132',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(1).plants(1)).minus().tr(1);
        }),
        description: 'Requires 1 ocean in play. Increase your titanium and plant production 1 step each. Lower your TR 1 step.',
      },
    });
  }
}
