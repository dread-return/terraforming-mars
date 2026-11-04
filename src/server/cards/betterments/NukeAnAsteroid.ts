import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectAmount} from '../../inputs/SelectAmount';
import {message} from '../../logs/MessageBuilder';
import {all} from '../Options';

export class NukeAnAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.NUKE_AN_ASTEROID,
      tags: [Tag.SPACE],
      cost: 16,

      behavior: {
        production: {titanium: 2},
      },

      metadata: {
        cardNumber: 'B36',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(2)).nbsp.titanium(5, {all}).asterix();
        }),
        description: 'Increase your titanium production 2 steps. Distribute 5 titanium among any number of other players.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    this.distribute(player, player.opponents, 5);
    return undefined;
  }

  // Asks how much each opponent gets, in order. The last opponent gets whatever is left.
  private distribute(player: IPlayer, opponents: ReadonlyArray<IPlayer>, remaining: number) {
    if (opponents.length === 0 || remaining === 0) {
      return;
    }
    const [opponent, ...rest] = opponents;
    if (rest.length === 0) {
      opponent.stock.add(Resource.TITANIUM, remaining, {log: true, from: {player}});
      return;
    }
    player.defer(() => {
      return new SelectAmount(message('Select how much titanium to give ${0}', (b) => b.player(opponent)), 'Give', 0, remaining)
        .andThen((amount) => {
          if (amount > 0) {
            opponent.stock.add(Resource.TITANIUM, amount, {log: true, from: {player}});
          }
          this.distribute(player, rest, remaining - amount);
          return undefined;
        });
    });
  }
}
