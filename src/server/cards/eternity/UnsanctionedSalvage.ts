import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Tag} from '../../../common/cards/Tag';

export class UnsanctionedSalvage extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.UNSANCTIONED_SALVAGE,
      tags: [Tag.EVENT],
      cost: 1,
      victoryPoints: -2,
      metadata: {
        cardNumber: 'E36',
        renderData: CardRenderer.builder((b) => {
          b.text('Take 1 card from the discard pile into your hand.');
        }),
        description: 'Return 1 card from the discard pile to your hand.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.projectDeck.discardPile.length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const pile = player.game.projectDeck.discardPile;
    return new SelectCard('Take a card from the discard pile', 'Take', pile.slice()).andThen(([card]) => {
      pile.splice(pile.indexOf(card), 1);
      player.cardsInHand.push(card);
      player.game.log('${0} took ${1} from the discard pile', (b) => b.player(player).card(card));
      return undefined;
    });
  }
}
