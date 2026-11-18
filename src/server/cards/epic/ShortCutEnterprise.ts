import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {CardResource} from '../../../common/CardResource';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {WildResourceCorporation} from './WildResourceCorporation';

export class ShortCutEnterprise extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.SHORT_CUT_ENTERPRISE,
      tags: [Tag.WILD],
      startingMegaCredits: 55,
      resourceType: CardResource.WILD_RESOURCE,
      firstAction: {
        text: 'Draw 2 active (blue) cards',
        drawCard: {count: 2, type: CardType.ACTIVE},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-SHC',
        description: 'You start with 55 M€. First action: draw 2 active cards.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(55).cards(2, {secondaryTag: AltSecondaryTag.BLUE});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Play an active card: +1 wild.', (eb) => {
              eb.cards(1, {secondaryTag: AltSecondaryTag.BLUE}).startEffect.resource(CardResource.WILD_RESOURCE).text('=').wild(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend X wild: play a card with tag reqs -X.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.cards(1, {secondaryTag: AltSecondaryTag.REQ}).tag(Tag.WILD).text('-1');
            });
          });
        }),
      },
    });
  }

  public data: {pending?: boolean, spend?: Record<string, number>} = {};

  public onCardPlayed(player: IPlayer, card: ICard) {
    const spend = this.data.pending === true ? this.data.spend?.[card.name] ?? 0 : 0;
    if (spend > 0) {
      player.removeResourceFrom(this, spend, {log: true});
    }
    if (card.type === CardType.ACTIVE) {
      this.addWild(player);
    }
  }

  /** Cards only playable with wild resources. Records how many each would need in data.spend. */
  private playable(player: IPlayer): Array<IProjectCard> {
    const normal = new Set(player.getPlayableCards().map((c) => c.name));
    const previous = this.data.pending;
    this.data.spend = {};
    this.data.pending = true;
    try {
      return player.getPlayableCards().filter((c) => !normal.has(c.name));
    } finally {
      this.data.pending = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    const result = this.resourceCount > 0 && this.playable(player).length > 0;
    this.data.spend = undefined;
    return result;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.playable(player);
    this.data.pending = true;
    return new SelectProjectCardToPlay(player, cards).andThen(() => {
      this.data.pending = false;
      this.data.spend = undefined;
      return undefined;
    });
  }
}
