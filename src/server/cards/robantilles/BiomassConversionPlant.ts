import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';

export class BiomassConversionPlant extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BIOMASS_CONVERSION_PLANT,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 10,

      behavior: {
        production: {energy: -1},
      },

      action: {
        spend: {plants: 2},
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 3},
      },

      metadata: {
        cardNumber: 'H38',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 plants to add 3 microbes to any card.', (eb) => {
            eb.plants(2).startAction.resource(CardResource.MICROBE, 3).asterix();
          }).br;
          b.production((pb) => pb.minus().energy(1));
        }),
        description: 'Decrease your energy production 1 step.',
      },
    });
  }
}
