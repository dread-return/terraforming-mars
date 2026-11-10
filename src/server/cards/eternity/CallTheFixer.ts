import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class CallTheFixer extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CALL_THE_FIXER,
      tags: [],
      cost: 0,
      metadata: {
        cardNumber: 'E52',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(0, {text: 'x'}).asterix().minus().cards(1, {text: 'x'}).br;
          b.production((pb) => pb.megacredits(0, {text: 'x'})).cards(1, {text: 'x/2'});
        }),
        description: 'This card costs X M\u20ac (paid as you play it). Discard X cards to increase your M\u20ac production X steps and draw X/2 cards (rounded down).',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.cardsInHand.length >= 2 && player.canAfford(1);
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(() => {
      const max = Math.min(player.cardsInHand.length, player.spendableMegacredits());
      if (max < 1) {
        return undefined;
      }
      return new SelectAmount('Select X: pay X M€ and discard X cards', 'Confirm', 1, max).andThen((x) => {
        player.game.defer(new SelectPaymentDeferred(player, x, {title: 'Pay X M€ for Call the Fixer'}).andThen(() => {
          player.defer(new SelectCard('Select X cards to discard', 'Discard', player.cardsInHand, {min: x, max: x}).andThen((cards) => {
            for (const c of cards) {
              player.discardCardFromHand(c, {log: true});
            }
            player.production.add(Resource.MEGACREDITS, x, {log: true});
            player.drawCard(Math.floor(x / 2));
            return undefined;
          }));
        }));
        return undefined;
      });
    });
    return undefined;
  }
}
