import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class SolarIrradiance extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SOLAR_IRRADIANCE,
      tags: [Tag.RADIOACTIVE],
      cost: 5,
      // The requirement icon shows 3 science tags; the card text says 5. Following the icon.
      requirements: {tag: Tag.SCIENCE, count: 3},
      behavior: {
        production: {heat: -1},
        stock: {megacredits: 1, steel: 1, titanium: 1, plants: 1, heat: 1, energy: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
      },

      metadata: {
        cardNumber: 'N33',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().heat(1)).nbsp.megacredits(1).steel(1).titanium(1).plants(1).br;
          b.heat(1).energy(1).resource(CardResource.RADIATION).asterix();
        }),
        description: 'Requires 3 science tags. Decrease your heat production 1 step. Gain 1 M€, 1 steel, 1 titanium, 1 plant, 1 heat and 1 energy, ' +
          'and add a radiation to ANY card.',
      },
    });
  }
}
