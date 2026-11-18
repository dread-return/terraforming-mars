import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {CardResource} from '../../../common/CardResource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {WildResourceCorporation} from './WildResourceCorporation';

export class DiscountConglomerate extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.DISCOUNT_CONGLOMERATE,
      tags: [Tag.WILD],
      startingMegaCredits: 42,
      resourceType: CardResource.WILD_RESOURCE,
      firstAction: {
        text: 'Draw 2 automated (green) cards',
        drawCard: {count: 2, type: CardType.AUTOMATED},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-DSC',
        description: 'You start with 42 M€ (+3 per other player). First action: draw 2 automated cards.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).megacredits(3, {text: '+3'}).slash().otherPlayer().cards(2, {secondaryTag: AltSecondaryTag.GREEN});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Production lowered: add a wild resource.', (eb) => {
              eb.production((pb) => pb.minus().wild(1)).startEffect.resource(CardResource.WILD_RESOURCE).text('=').wild(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend X wild: play a card for 3X M€ less.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.cards(1).megacredits(-3);
            });
          });
        }),
      },
    });
  }

  public data: {discount?: number} = {};

  protected override perOpponent() {
    return 3;
  }

  public override getCardDiscount(_player: IPlayer, _card: IProjectCard) {
    return this.data.discount ?? 0;
  }

  private playableWith(player: IPlayer, wild: number): Array<IProjectCard> {
    const previous = this.data.discount;
    this.data.discount = 3 * wild;
    try {
      return player.getPlayableCards();
    } finally {
      this.data.discount = previous;
    }
  }

  /** The fewest wild resources (at least 1) that make some card playable, or undefined. */
  private minimumWild(player: IPlayer): number | undefined {
    for (let x = 1; x <= this.resourceCount; x++) {
      if (this.playableWith(player, x).length > 0) {
        return x;
      }
    }
    return undefined;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && this.playableWith(player, this.resourceCount).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const min = this.minimumWild(player) ?? 1;
    const play = (x: number) => {
      const cards = this.playableWith(player, x);
      player.removeResourceFrom(this, x, {log: true});
      this.data.discount = 3 * x;
      return new SelectProjectCardToPlay(player, cards).andThen(() => {
        this.data.discount = undefined;
        return undefined;
      });
    };
    if (min === this.resourceCount) {
      return play(min);
    }
    return new SelectAmount('Spend how many wild resources (3 M€ off each)?', 'Spend', min, this.resourceCount, true).andThen(play);
  }
}
