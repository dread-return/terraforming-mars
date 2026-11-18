import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {WildResourceCorporation} from './WildResourceCorporation';

export class StreamlineLogistics extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.STREAMLINE_LOGISTICS,
      tags: [Tag.WILD],
      startingMegaCredits: 53,
      resourceType: CardResource.WILD_RESOURCE,
      action: {},

      metadata: {
        cardNumber: 'EP-STL',
        description: 'You start with 53 M€ (+2 per other player).',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(53).megacredits(2, {text: '+2'}).slash().otherPlayer();
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Play an event: add a wild resource.', (eb) => {
              eb.cards(1, {secondaryTag: Tag.EVENT}).startEffect.resource(CardResource.WILD_RESOURCE).text('=').wild(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend 1 wild: 2 extra actions this turn.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.text('+2 actions', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  protected override perOpponent() {
    return 2;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT) {
      this.addWild(player);
    }
  }

  public override bespokeCanAct() {
    return this.resourceCount > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.removeResourceFrom(this, 1, {log: true});
    player.availableActionsThisRound += 2;
    player.game.log('${0} may take 2 extra actions this turn', (b) => b.player(player));
    return undefined;
  }
}
