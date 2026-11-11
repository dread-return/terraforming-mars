import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {EternityUtils} from './EternityUtils';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class EndOfPhaeton extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.END_OF_PHAETON,
      tags: [Tag.SPACE],
      cost: 60,
      requirements: {tag: Tag.JOVIAN},
      metadata: {
        cardNumber: 'E10',
        renderData: CardRenderer.builder((b) => {
          b.minus().tag(Tag.JOVIAN).asterix().br;
          b.cards(1).asterix().nbsp.cards(1).text('from discard', {size: Size.SMALL});
        }),
        description: 'Requires a non-wild Jovian tag. Remove one of your Jovian-tag cards from the game. Play 1 card from hand and 1 from the discard pile, ignoring requirements and costs.',
      },
    });
  }

  private jovians(player: IPlayer): Array<ICard> {
    return player.playedCards.filter((c) => c.type !== CardType.EVENT && c.tags.includes(Tag.JOVIAN));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.jovians(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectCard('Select a Jovian card to remove from the game', 'Remove', this.jovians(player)).andThen(([card]) => {
      player.playedCards.remove(card);
      player.removedFromPlayCards.push(card as IProjectCard);
      player.game.log('${0} removed ${1} from the game', (b) => b.player(player).card(card));
      EternityUtils.playFree(player, () => player.cardsInHand.filter((c) => c !== this), 'Select a card from your hand to play for free', false);
      EternityUtils.playFree(player, () => player.game.projectDeck.discardPile, 'Select a card from the discard pile to play for free', true);
      return undefined;
    }));
    return undefined;
  }
}
