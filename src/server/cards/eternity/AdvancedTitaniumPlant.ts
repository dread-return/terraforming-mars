import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class AdvancedTitaniumPlant extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ADVANCED_TITANIUM_PLANT,
      tags: [Tag.MARS, Tag.BUILDING, Tag.SCIENCE],
      cost: 12,
      behavior: {
        production: {energy: -1, titanium: 1},
        titaniumValue: 1,
      },
      metadata: {
        cardNumber: 'E02',
        renderData: CardRenderer.builder((b) => {
          b.effect('Your titanium resources are each worth 1 M€ extra.', (eb) => eb.titanium(1).startEffect.plus().megacredits(1)).br;
          b.production((pb) => pb.minus().energy(1).nbsp.plus().titanium(1));
        }),
        description: 'Decrease your energy production 1 step and increase your titanium production 1 step.',
      },
    });
  }
}
