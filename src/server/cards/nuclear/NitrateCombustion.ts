import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class NitrateCombustion extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NITRATE_COMBUSTION,
      tags: [Tag.SCIENCE, Tag.POWER],
      cost: 16,
      behavior: {
        global: {temperature: 1},
        production: {energy: 2},
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 2},
      },

      metadata: {
        cardNumber: 'N41',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).nbsp.production((pb) => pb.energy(2)).nbsp.resource(CardResource.MICROBE, 2).asterix();
        }),
        description: 'Raise the temperature 1 step. Increase your energy production 2 steps. Add 2 microbes to ANY card.',
      },
    });
  }
}
