import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';

export class CoalitionSteamHarvester extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.COALITION_STEAM_HARVESTER,
      tags: [Tag.JOVIAN, Tag.VENUS],
      cost: 11,
      resourceType: CardResource.FLOATER,
      requirements: {venus: 18},
      behavior: {
        addResources: 1,
      },
      metadata: {
        cardNumber: 'E07',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 6 M€ and remove 1 floater here to add 1 floater to each of your OTHER floater cards and raise Venus 1 step.', (eb) => {
            eb.megacredits(6).resource(CardResource.FLOATER).startAction.resource(CardResource.FLOATER).asterix().venus(1);
          }).br;
          b.resource(CardResource.FLOATER);
        }),
        description: 'Requires 18% Venus. Add 1 floater here.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return this.resourceCount > 0 && player.canAfford(6);
  }
  public action(player: IPlayer) {
    player.stock.deduct(Resource.MEGACREDITS, 6);
    player.removeResourceFrom(this, 1);
    for (const card of player.getResourceCards(CardResource.FLOATER)) {
      if (card !== this) {
        player.addResourceTo(card, {qty: 1, log: true});
      }
    }
    player.game.increaseVenusScaleLevel(player, 1);
    return undefined;
  }
}
