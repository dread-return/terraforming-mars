import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Tag} from '../../../common/cards/Tag';

export class BlackHoleProbe extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BLACK_HOLE_PROBE,
      tags: [Tag.SPACE],
      cost: 10,
      resourceType: CardResource.SINGULARITY,
      victoryPoints: {resourcesHere: {}, each: -1},
      behavior: {
        tr: 1,
      },
      metadata: {
        cardNumber: 'E50',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 6 M€ (titanium may be used) to take a card of your choice from the discard pile into your hand and add 1 singularity here.', (eb) => {
            eb.megacredits(6).super((b) => b.titanium(1)).startAction.cards(1).asterix().resource(CardResource.SINGULARITY);
          }).br;
          b.tr(1);
        }),
        description: 'Raise your TR 1 step. -1 VP per singularity here.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.game.projectDeck.discardPile.length > 0 && player.canAfford({cost: 6, titanium: true});
  }
  public action(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 6, {canUseTitanium: true}).andThen(() => {
      const pile = player.game.projectDeck.discardPile;
      if (pile.length === 0) {
        return;
      }
      player.defer(new SelectCard('Take a card from the discard pile', 'Take', pile.slice()).andThen(([card]) => {
        pile.splice(pile.indexOf(card), 1);
        player.cardsInHand.push(card);
        player.game.log('${0} took ${1} from the discard pile', (b) => b.player(player).card(card));
        player.addResourceTo(this, {qty: 1, log: true});
        return undefined;
      }));
    }));
    return undefined;
  }
}
