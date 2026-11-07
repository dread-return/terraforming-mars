import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class UraniumMine extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.URANIUM_MINE,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 14,
      behavior: {
        production: {steel: 1, titanium: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
      },

      metadata: {
        cardNumber: 'N23',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(1).titanium(1)).nbsp.resource(CardResource.RADIATION).asterix();
        }),
        description: 'Increase your steel and titanium production 1 step. Add a radiation to ANY card.',
      },
    });
  }
}
