import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class WasteDisposalTax extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.WASTE_DISPOSAL_TAX,
      tags: [Tag.EARTH],
      cost: 3,
      behavior: {
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
        drawCard: 1,
      },

      metadata: {
        cardNumber: 'N65',
        renderData: CardRenderer.builder((b) => {
          b.minus().megacredits(1, {all}).asterix().nbsp.resource(CardResource.RADIATION).asterix().nbsp.cards(1);
        }),
        description: 'Pay 1 M€ to every opponent. Add a radiation to ANY card. Draw a card.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.canAfford(player.getCardCost(this) + player.opponents.length);
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      if (player.megaCredits > 0) {
        player.stock.deduct(Resource.MEGACREDITS, 1);
        opponent.stock.add(Resource.MEGACREDITS, 1, {log: true});
      }
    }
    return undefined;
  }
}
