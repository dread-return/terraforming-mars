import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {ActionCard} from '../ActionCard';
import {IProjectCard} from '../IProjectCard';
import {digit} from '../Options';

export class TrojanAsteroids extends ActionCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.TROJAN_ASTEROIDS,
      type: CardType.ACTIVE,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 18,
      resourceType: CardResource.ASTEROID,
      action: {
        or: {
          behaviors: [
            {
              title: 'Pay 1 energy to add 1 asteroid to any card',
              spend: {energy: 1},
              addResourcesToAnyCard: {type: CardResource.ASTEROID, count: 1},
            },
            {
              title: 'Spend 1 asteroid here to gain 4 steel',
              spend: {resourcesHere: 1},
              stock: {steel: 4},
            },
            {
              title: 'Spend 1 asteroid here to gain 3 titanium',
              spend: {resourcesHere: 1},
              stock: {titanium: 3},
            },
          ],
        },
      },
      metadata: {
        cardNumber: 'MM38',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 1 energy to add 1 asteroid to any card.', (ab) => {
            ab.energy(1).startAction.resource(CardResource.ASTEROID).asterix();
          }).br;
          b.or().br;
          b.action('Spend 1 asteroid here to gain 4 steel or 3 titanium.', (ab) => {
            ab.resource(CardResource.ASTEROID).startAction.steel(4, {digit}).or().titanium(3, {digit});
          });
        }),
      },
    });
  }
}
