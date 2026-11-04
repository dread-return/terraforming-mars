import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {PartyName} from '../../../common/turmoil/PartyName';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SerializedCard} from '../../SerializedCard';
import {newProjectCard} from '../../createCard';
import {isIProjectCard} from '../IProjectCard';

export class UtopiaPlanitiaSpaceport extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.UTOPIA_PLANITIA_SPACEPORT,
      tags: [Tag.MARS, Tag.SPACE],
      cost: 24,
      requirements: {party: PartyName.UNITY},
      victoryPoints: 2,

      metadata: {
        cardNumber: 'H15',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may place a space event you play here (one at a time).', (eb) => {
            eb.tag(Tag.SPACE).tag(Tag.EVENT).startEffect.text('here');
          }).br;
          b.action('Replay it for 8 M€ less, +1 TR per its VP, then discard it.', (eb) => {
            eb.megacredits(-8).startAction.tr(1).asterix();
          });
        }),
        description: 'Requires Unity ruling or 2 delegates there.',
      },
    });
  }

  /** The space event currently stored on this card. */
  public hostedEvent: IProjectCard | undefined = undefined;
  private replaying = false;

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (this.replaying || this.hostedEvent !== undefined) {
      return undefined;
    }
    if (card.type !== CardType.EVENT || !card.tags.includes(Tag.SPACE) || !isIProjectCard(card)) {
      return undefined;
    }
    return new OrOptions(
      new SelectOption(`Place ${card.name} on ${this.name}`).andThen(() => {
        if (player.playedCards.remove(card)) {
          this.hostedEvent = card;
          player.game.log('${0} placed ${1} on ${2}', (b) => b.player(player).card(card).card(this));
        }
        return undefined;
      }),
      new SelectOption('Do not place it').andThen(() => undefined),
    );
  }

  private replayCost(player: IPlayer, card: IProjectCard): number {
    return Math.max(0, player.getCardCost(card) - 8);
  }

  public canAct(player: IPlayer) {
    const card = this.hostedEvent;
    if (card === undefined) {
      return false;
    }
    return player.canAfford({cost: this.replayCost(player, card), titanium: true});
  }

  public action(player: IPlayer) {
    const card = this.hostedEvent;
    if (card === undefined) {
      return undefined;
    }
    this.hostedEvent = undefined;
    player.game.defer(new SelectPaymentDeferred(player, this.replayCost(player, card), {canUseTitanium: true, title: 'Select how to pay to replay the event'}))
      .andThen(() => {
        this.replaying = true;
        try {
          player.playCard(card, undefined, 'nothing');
        } finally {
          this.replaying = false;
        }
        const vp = typeof card.victoryPoints === 'number' ? card.victoryPoints : card.getVictoryPoints(player);
        if (vp > 0) {
          player.increaseTerraformRating(vp, {log: true});
        }
        player.game.projectDeck.discard(card);
        player.game.log('${0} discarded ${1}', (b) => b.player(player).card(card));
      });
    return undefined;
  }

  public override getVictoryPoints() {
    return 2;
  }

  serialize(serialized: SerializedCard): void {
    if (this.hostedEvent !== undefined) {
      serialized.targetCards = [{card: {name: this.hostedEvent.name}, resourceCount: 0}];
    }
  }

  deserialize(serialized: SerializedCard): void {
    const name = serialized.targetCards?.[0]?.card.name;
    this.hostedEvent = name !== undefined ? newProjectCard(name) : undefined;
  }
}
