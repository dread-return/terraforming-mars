import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';
import {TileType} from '../../../common/TileType';

export class Upheaval extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.UPHEAVAL,
      tags: [],
      cost: 1,
      victoryPoints: -1,
      metadata: {
        cardNumber: 'E135',
        renderData: CardRenderer.builder((b) => {
          b.text('Return one of your played cards to your hand. Remove any special tile it placed.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Return one of your played blue, green or face-down red cards to your hand. If it placed a special tile, remove that tile from the board.',
      },
    });
  }

  private targets(player: IPlayer): Array<IProjectCard> {
    return player.playedCards.projects().filter((c) => c.name !== this.name);
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.targets(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    player.defer(() => new SelectCard('Select a card to return to your hand', 'Return', this.targets(player)).andThen(([card]) => {
      player.playedCards.remove(card);
      card.resourceCount = 0;
      for (const space of game.board.spaces) {
        const tile = space.tile;
        if (tile?.card === card.name && tile.tileType !== TileType.OCEAN && tile.tileType !== TileType.GREENERY && tile.tileType !== TileType.CITY) {
          game.removeTile(space.id);
          game.log('${0} was removed from the board', (b) => b.tileType(tile.tileType));
        }
      }
      player.cardsInHand.push(card);
      game.log('${0} returned ${1} to their hand', (b) => b.player(player).card(card));
      return undefined;
    }));
    return undefined;
  }
}
