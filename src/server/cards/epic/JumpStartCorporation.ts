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
import {WildResourceCorporation} from './WildResourceCorporation';
import {SelectResources} from '../../inputs/SelectResources';

export class JumpStartCorporation extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.JUMP_START_CORPORATION,
      tags: [Tag.WILD],
      startingMegaCredits: 11,
      resourceType: CardResource.WILD_RESOURCE,
      action: {},

      metadata: {
        cardNumber: 'EP-JMP',
        description: 'You start with 14 standard resources of choice and 11 M€ (+4 per other player).',
        renderData: CardRenderer.builder((b) => {
          b.text('14').wild(1).megacredits(11).megacredits(4, {text: '+4'}).slash().otherPlayer();
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Raise a global parameter: 1 wild resource per step.', (eb) => {
              eb.temperature(1, {size: Size.SMALL}).oxygen(1, {size: Size.SMALL}).oceans(1, {size: Size.SMALL}).venus(1, {size: Size.SMALL}).startEffect.resource(CardResource.WILD_RESOURCE);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend X wild: play a card, global reqs ±X steps.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.cards(1, {secondaryTag: AltSecondaryTag.REQ}).text('±1');
            });
          });
        }),
      },
    });
  }

  public data: {pending?: boolean, spend?: Record<string, number>} = {};

  protected override perOpponent() {
    return 4;
  }

  public override bespokePlay(player: IPlayer) {
    super.bespokePlay(player);
    player.defer(new SelectResources('Jump-Start Corporation: gain 14 standard resources', 14).andThen((units) => {
      player.stock.adjust(units, {log: true});
      return undefined;
    }));
    return undefined;
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

  public onCardPlayed(player: IPlayer, card: ICard) {
    const spend = this.data.pending === true ? this.data.spend?.[card.name] ?? 0 : 0;
    if (spend > 0) {
      player.removeResourceFrom(this, spend, {log: true});
    }
  }
}
