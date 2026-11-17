import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';
import {isIProjectCard} from '../IProjectCard';

export class Ouroboros extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OUROBOROS,
      tags: [Tag.EARTH],
      startingMegaCredits: 48,

      metadata: {
        cardNumber: 'EP-OUR',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(48);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.EARTH, {all}).startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Any Earth tag (incl. corps, preludes): +2 M€. Your Earth tag: next card or standard project this generation costs 3 M€ less.', (eb) => {
              eb.tag(Tag.EARTH).startEffect.text('next').cards(1).megacredits(-3).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {generation?: number, pending?: number} = {};

  private pendingDiscount(player: IPlayer): number {
    return this.data.generation === player.game.generation ? 3 * (this.data.pending ?? 0) : 0;
  }

  public override getCardDiscount(player: IPlayer) {
    return this.pendingDiscount(player);
  }

  public getStandardProjectDiscount(player: IPlayer) {
    return this.pendingDiscount(player);
  }

  public onStandardProject() {
    this.data.pending = 0;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    if (isIProjectCard(card)) {
      // The discount was used on this card.
      this.data.pending = 0;
    }
    if (player.tags.cardTagCount(card, Tag.EARTH) > 0) {
      this.data.generation = player.game.generation;
      this.data.pending = 1;
    }
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card === this) {
      return;
    }
    const earth = thisCardOwner.tags.cardTagCount(card, Tag.EARTH);
    if (earth > 0) {
      thisCardOwner.stock.add(Resource.MEGACREDITS, 2 * earth, {log: true, from: {card: this}});
    }
  }
}
