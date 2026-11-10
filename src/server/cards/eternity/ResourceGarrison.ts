import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class ResourceGarrison extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.RESOURCE_GARRISON,
      tags: [],
      cost: 5,
      metadata: {
        cardNumber: 'E111',
        renderData: CardRenderer.builder((b) => {
          b.effect('Opponents may not decrease your steel, titanium or plant production.', (eb) => eb.production((pb) => pb.steel(1).titanium(1).plants(1)).startEffect.text('protected')).br;
          b.effect('Opponents may not steal or remove your M€, steel or titanium.', (eb) => eb.megacredits(1).steel(1).titanium(1).startEffect.text('protected'));
        }),
      },
    });
  }
}
