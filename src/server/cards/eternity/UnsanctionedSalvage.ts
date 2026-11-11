import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {EternityUtils} from './EternityUtils';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Size} from '../../../common/cards/render/Size';

export class UnsanctionedSalvage extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.UNSANCTIONED_SALVAGE,
      tags: [],
      cost: 1,
      metadata: {
        cardNumber: 'E36',
        renderData: CardRenderer.builder((b) => {
          b.text('Shuffle the discard pile and reveal 3 cards from it. Take 1 into your hand and discard the other 2.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.projectDeck.discardPile.length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    EternityUtils.junkVenturesDraw(player);
    return undefined;
  }
}
