import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {Size} from '../../../common/cards/render/Size';

export class IndustrialSpy extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.INDUSTRIAL_SPY,
      cost: 1,

      metadata: {
        cardNumber: 'I07',
        renderData: CardRenderer.builder((b) => {
          b.text('Look at a player\'s hand.', {size: Size.MEDIUM, uppercase: true});
        }),
      },
    });
  }

  private look(player: IPlayer, target: IPlayer) {
    const game = player.game;
    game.log('${0} looked at ${1}\'s hand', (b) => b.player(player).player(target));
    if (target.cardsInHand.length === 0) {
      game.log('${0} has no cards in hand', (b) => b.player(target), {reservedFor: player});
      return undefined;
    }
    return new SelectCard(`${target.name}'s hand`, 'OK', target.cardsInHand, {min: 0, max: 0, played: false})
      .andThen(() => undefined);
  }

  public override bespokePlay(player: IPlayer) {
    const opponents = player.opponents;
    if (opponents.length === 0) {
      return undefined;
    }
    if (opponents.length === 1) {
      return this.look(player, opponents[0]);
    }
    return new SelectPlayer(opponents, 'Select the player whose hand you want to look at', 'Look')
      .andThen((target) => this.look(player, target));
  }
}
