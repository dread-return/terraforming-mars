import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class SoilDecontamination extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SOIL_DECONTAMINATION,
      tags: [Tag.RADIOACTIVE, Tag.MICROBE, Tag.PLANT],
      cost: 21,
      requirements: {tag: Tag.MARS, count: 2},
      victoryPoints: 1,
      behavior: {
        production: {megacredits: -1, plants: 2},
        decreaseAnyProduction: {type: Resource.PLANTS, count: 1},
        stock: {plants: 2},
        addResourcesToAnyCard: [
          {type: CardResource.MICROBE, count: 1},
          {type: CardResource.RADIATION, count: 2},
        ],
      },

      metadata: {
        cardNumber: 'N13',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(1).plants(1, {all}).br.plus().plants(2)).br;
          b.plants(2).resource(CardResource.MICROBE).asterix().nbsp.resource(CardResource.RADIATION, 2).asterix();
        }),
        description: 'Requires 2 Mars tags. Decrease your M€ production and any plant production 1 step. Increase your plant production 2 steps. ' +
          'Gain 2 plants, add a microbe to ANY card and add 2 radiation to ANY card.',
      },
    });
  }
}
