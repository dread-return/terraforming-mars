import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class ResourcefulCollective extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.RESOURCEFUL_COLLECTIVE,
      tags: [Tag.EARTH],
      startingMegaCredits: 38,
      cardDiscount: {amount: 1},
      action: {},

      metadata: {
        cardNumber: 'EP-RSC',
        description: 'You start with 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Cards cost 1 M€ less.', (eb) => {
              eb.cards(1).startEffect.megacredits(-1);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend 4 M€ to add a resource to one of your cards (not one worth 2+ VP per resource).', (eb) => {
              eb.megacredits(4).startAction.wild(1).asterix();
            });
          });
        }),
      },
    });
  }

  private static allowed(card: ICard): boolean {
    const vp = card.victoryPoints;
    if (typeof vp === 'object' && vp.resourcesHere !== undefined) {
      return (vp.each ?? 1) / (vp.per ?? 1) < 2;
    }
    return true;
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford(4) && player.getResourceCards().some((c) => ResourcefulCollective.allowed(c));
  }

  public override bespokeAction(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 4).andThen(() => {
      player.game.defer(new AddResourcesToCard(player, undefined, {count: 1, filter: (c) => ResourcefulCollective.allowed(c)}));
    }));
    return undefined;
  }
}
