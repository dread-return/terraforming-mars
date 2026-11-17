import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

export class OutterPlanetsUnion extends ActCard {
  constructor() {
    super({
      name: CardName.OUTTER_PLANETS_UNION,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.JOVIAN],
      bothBehavior: {addResourcesToAnyCard: {type: CardResource.FLOATER, count: 2}},
      metadata: {
        cardNumber: 'ACT03',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.FLOATER, 2).asterix().text('all your colony bonuses', {size: Size.SMALL});
        }),
        description: 'Resolve (both): add 2 floaters to any card. Gain all your colony bonuses.',
      },
    });
  }

  public override resolveFor(player: IPlayer, other: IPlayer | undefined) {
    super.resolveFor(player, other);
    for (const colony of player.game.colonies) {
      for (const owner of colony.colonies) {
        if (owner === player.id) {
          colony.giveColonyBonus(player);
        }
      }
    }
  }
}
