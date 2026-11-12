import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';

export class ReDevelopmentOffice extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.RE_DEVELOPMENT_OFFICE,
      type: CardType.ACTIVE,
      cost: 5,
      tags: [Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L16',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw a card from the discard pile for every tile adjacent to the adjacent Special tile.', (ab) => ab.empty().startAction.cards(1).slash().text('special', {size: Size.SMALL}).emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Re-Development Office tile on top of one of your cities adjacent to a Special tile. Action: draw a card from the discard pile for every tile adjacent to the adjacent Special tile.',
      },
    });
  }

  protected override spaceAllowed(player: IPlayer, space: Space): boolean {
    return Postludes.neighbors(player.game, space).some(Postludes.isSpecialTile);
  }

  /** Each adjacent Special tile counts the tiles next to it (this one included). */
  private count(player: IPlayer): number {
    const game = player.game;
    let count = 0;
    for (const special of this.adjacentTiles(player).filter(Postludes.isSpecialTile)) {
      count += Postludes.neighbors(game, special).filter((space) => space.tile !== undefined).length;
    }
    return count;
  }

  public canAct(player: IPlayer): boolean {
    return this.count(player) > 0 && player.game.projectDeck.discardPile.length > 0;
  }

  public action(player: IPlayer) {
    const pile = player.game.projectDeck.discardPile;
    const cards = pile.splice(Math.max(0, pile.length - this.count(player)));
    player.cardsInHand.push(...cards);
    player.game.log('${0} drew ${1} card(s) from the discard pile', (b) => b.player(player).number(cards.length));
    return undefined;
  }
}
