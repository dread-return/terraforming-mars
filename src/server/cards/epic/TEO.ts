import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';
import {isIProjectCard} from '../IProjectCard';

export class TEO extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TEO,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 30,
      cardDiscount: {tag: Tag.SCIENCE, per: 'card', amount: 2},
      action: {},

      metadata: {
        cardNumber: 'EP-TEO',
        description: 'You start with 30 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(30);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Science cards cost 2 M€ less.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.megacredits(-2);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Play a non-event card for 5 M€ less, face down as an event (no tags or lasting effects).', (eb) => {
              eb.cards(1).megacredits(-5).startAction.cards(1, {secondaryTag: Tag.EVENT}).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {pending?: boolean} = {};

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    return super.getCardDiscount(player, card) + (this.data.pending === true ? 5 : 0);
  }

  private playable(player: IPlayer): Array<IProjectCard> {
    const previous = this.data.pending;
    this.data.pending = true;
    try {
      return player.getPlayableCards().filter((card) => card.type !== CardType.EVENT);
    } finally {
      this.data.pending = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.playable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.playable(player);
    this.data.pending = true;
    return new SelectProjectCardToPlay(player, cards);
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (this.data.pending !== true || card === this || !isIProjectCard(card) || card.type === CardType.EVENT) {
      return;
    }
    this.data.pending = false;
    // Its immediate effects resolve; then it is flipped face down and leaves the tableau.
    player.defer(() => {
      player.discardPlayedCard(card);
      player.game.log('${0} played ${1} face down as an event', (b) => b.player(player).card(card));
    });
  }
}
