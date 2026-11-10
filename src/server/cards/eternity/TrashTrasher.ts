import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';

export class TrashTrasher extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TRASH_TRASHER,
      tags: [],
      cost: 8,
      resourceType: CardResource.TRASH,
      victoryPoints: {resourcesHere: {}},
      metadata: {
        cardNumber: 'E134',
        renderData: CardRenderer.builder((b) => {
          b.action('If the discard pile has 30+ cards, remove it from the game to gain 4 M€ and add a trash counter here.', (eb) => eb.text('DISCARD PILE (30+)').startAction.megacredits(4).resource(CardResource.TRASH)).br;
          b.text('Remove the discard pile from the game.', {size: Size.SMALL});
        }),
        description: 'When this comes into play, remove the discard pile from the game. 1 VP per trash counter here.',
      },
    });
  }

  private trash(player: IPlayer) {
    const pile = player.game.projectDeck.discardPile;
    const removed = pile.splice(0, pile.length);
    player.game.log('${0} removed ${1} cards in the discard pile from the game', (b) => b.player(player).number(removed.length));
  }
  public override bespokePlay(player: IPlayer) {
    this.trash(player);
    return undefined;
  }
  public canAct(player: IPlayer) {
    return player.game.projectDeck.discardPile.length >= 30;
  }
  public action(player: IPlayer) {
    this.trash(player);
    player.stock.add(Resource.MEGACREDITS, 4, {log: true});
    player.addResourceTo(this, {qty: 1, log: true});
    return undefined;
  }
}
