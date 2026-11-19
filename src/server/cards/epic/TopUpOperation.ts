import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {CardResource} from '../../../common/CardResource';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {isIProjectCard} from '../IProjectCard';
import {WildResourceCorporation} from './WildResourceCorporation';

export class TopUpOperation extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.TOP_UP_OPERATION,
      tags: [Tag.WILD],
      startingMegaCredits: 48,
      resourceType: CardResource.WILD_RESOURCE,
      initialActionText: 'Draw 2 cards with requirements',
      action: {},

      metadata: {
        cardNumber: 'EP-TOP',
        description: 'You start with 48 M€ (+2 per other player). First action: draw 2 cards with requirements.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48).megacredits(2, {text: '+2'}).slash().otherPlayer().cards(2, {secondaryTag: AltSecondaryTag.REQ});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Play a card with reqs: +1 wild.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.REQ}).startEffect.resource(CardResource.WILD_RESOURCE).text('=').wild(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend 1 wild: play a card, no max reqs.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.text('max', {size: Size.SMALL}).cards(1, {secondaryTag: AltSecondaryTag.REQ, cancelled: true});
            });
          });
        }),
      },
    });
  }

  public data: {pending?: boolean} = {};

  protected override perOpponent() {
    return 2;
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(2, {include: (c) => c.requirements.length > 0});
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (isIProjectCard(card) && card.requirements.length > 0) {
      this.addWild(player);
    }
  }

  private playable(player: IPlayer): Array<IProjectCard> {
    const normal = new Set(player.getPlayableCards().map((c) => c.name));
    const previous = this.data.pending;
    this.data.pending = true;
    try {
      return player.getPlayableCards().filter((c) => !normal.has(c.name));
    } finally {
      this.data.pending = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && this.playable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.playable(player);
    player.removeResourceFrom(this, 1, {log: true});
    this.data.pending = true;
    return new SelectProjectCardToPlay(player, cards).andThen(() => {
      this.data.pending = false;
      return undefined;
    });
  }
}
