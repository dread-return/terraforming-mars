import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';

export class AetherVial extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.AETHER_VIAL,
      tags: [Tag.MERCURY],
      startingMegaCredits: 40,
      action: {},

      metadata: {
        cardNumber: 'EP-AEV',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('After production: add or discard up to 5 M€ here.', (eb) => {
              eb.text('prod.').startEffect.text('±').megacredits(5, {text: '≤5'});
            });
            ce.vSpace(Size.TINY);
            ce.action('Play a card costing EXACTLY the M€ here, for free.', (eb) => {
              eb.empty().startAction.cards(1).text('= M€ here').megacredits(0);
            });
          });
        }),
      },
    });
  }

  public data: {stored?: number, pending?: boolean} = {};

  private stored(): number {
    return this.data.stored ?? 0;
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return this.data.pending === true && card.cost === this.stored() ? card.cost : 0;
  }

  private playable(player: IPlayer): Array<IProjectCard> {
    const previous = this.data.pending;
    this.data.pending = true;
    try {
      return player.getPlayableCards().filter((c) => c.cost === this.stored());
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
    return new SelectProjectCardToPlay(player, cards).andThen(() => {
      this.data.pending = false;
      return undefined;
    });
  }
  // The after-production choice is in EpicHooks.onGenerationStart.
}
