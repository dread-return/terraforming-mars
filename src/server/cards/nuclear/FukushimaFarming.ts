import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class FukushimaFarming extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FUKUSHIMA_FARMING,
      tags: [Tag.RADIOACTIVE, Tag.MICROBE, Tag.PLANT],
      cost: 16,
      requirements: {temperature: -12},
      behavior: {
        production: {plants: 2},
        stock: {plants: 1},
        addResourcesToAnyCard: [
          {type: CardResource.MICROBE, count: 2},
          {type: CardResource.RADIATION, count: 3},
        ],
      },

      metadata: {
        cardNumber: 'N14',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).plants(1).br;
          b.resource(CardResource.MICROBE, 2).asterix().nbsp.resource(CardResource.RADIATION, 3).asterix();
        }),
        description: 'Requires -12 °C or warmer. Increase your plant production 2 steps, gain 1 plant, add 2 microbes to ANY card and add 3 radiation to ANY card.',
      },
    });
  }
}
