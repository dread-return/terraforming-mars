import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';

export class GalacticPanorama extends PreludeCard {
  constructor() {
    super({
      name: CardName.GALACTIC_PANORAMA,
      tags: [],
      behavior: {
        or: {
          behaviors: [
            {title: 'Increase your M€ production 1 step, place a greenery, gain 1 steel and 2 M€', production: {megacredits: 1}, greenery: {}, stock: {steel: 1, megacredits: 2}},
            {title: 'Increase your M€ production 2 steps, place an ocean, gain 1 titanium', production: {megacredits: 2}, ocean: {}, stock: {titanium: 1}},
          ],
        },
      },
      metadata: {
        cardNumber: 'EP20',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).greenery().steel(1).megacredits(2).br.or().br.production((pb) => pb.megacredits(2)).oceans(1).titanium(1);
        }),
        description: 'Choose 1: increase your M\u20ac production 1 step, place a greenery, gain 1 steel and 2 M\u20ac; OR increase your M\u20ac production 2 steps, place an ocean and gain 1 titanium.',
      },
    });
  }
}
