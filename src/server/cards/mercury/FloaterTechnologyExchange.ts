import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';

export class FloaterTechnologyExchange extends ActCard {
  constructor() {
    super({
      name: CardName.FLOATER_TECHNOLOGY_EXCHANGE,
      kind: 'treaty',
      steps: 7,
      tags: [],
      bothBehavior: {drawCard: {count: 1, resource: CardResource.FLOATER}, addResourcesToAnyCard: {type: CardResource.FLOATER, count: 4}},
      metadata: {
        cardNumber: 'ACT26',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).asterix().resource(CardResource.FLOATER, 4).asterix();
        }),
        description: 'One of the players requires a floater. Resolve (both): draw a card with a floater symbol. Add 4 floaters to any card.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.getResourceCount(CardResource.FLOATER) > 0 || other.getResourceCount(CardResource.FLOATER) > 0;
  }
}
