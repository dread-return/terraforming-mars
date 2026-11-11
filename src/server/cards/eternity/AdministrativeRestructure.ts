import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Size} from '../../../common/cards/render/Size';

export class AdministrativeRestructure extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ADMINISTRATIVE_RESTRUCTURE,
      tags: [],
      cost: 5,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E01',
        renderData: CardRenderer.builder((b) => {
          b.text('For the rest of this generation, each player takes 1 action per turn instead of 2.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  public data: {gen?: number} = {};
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    this.data = {gen: game.generation};
    for (const p of game.players) {
      p.availableActionsThisRound = 1;
    }
    game.log('For the rest of generation ${0}, each player takes only 1 action per turn', (b) => b.number(game.generation));
    return undefined;
  }
}
