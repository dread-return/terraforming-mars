import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IColony} from '../../colonies/IColony';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectColony} from '../../inputs/SelectColony';
import {LogHelper} from '../../LogHelper';
import {MAX_COLONY_TRACK_POSITION} from '../../../common/constants';

export class MarketManipulationCB extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARKET_MANIPULATION_CB,
      tags: [Tag.EARTH],
      cost: 15,

      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'B28',
        renderData: CardRenderer.builder((b) => {
          b.action('Move one colony tile track marker up or down 1 step.', (eb) => {
            eb.empty().startAction.text('+/-1').colonies(1).asterix();
          }).br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Increase your M€ production 2 steps.',
      },
    });
  }

  private increasable(player: IPlayer): Array<IColony> {
    return player.game.colonies.filter((c) => c.isActive && c.trackPosition < MAX_COLONY_TRACK_POSITION);
  }

  private decreasable(player: IPlayer): Array<IColony> {
    return player.game.colonies.filter((c) => c.isActive && c.trackPosition > c.colonies.length);
  }

  public canAct(player: IPlayer): boolean {
    return this.increasable(player).length > 0 || this.decreasable(player).length > 0;
  }

  public action(player: IPlayer) {
    const options = new OrOptions();
    const increasable = this.increasable(player);
    const decreasable = this.decreasable(player);
    if (increasable.length > 0) {
      options.options.push(new SelectColony('Select a colony tile track to move up', 'Move up', increasable)
        .andThen((colony) => {
          colony.increaseTrack();
          LogHelper.logColonyTrackIncrease(player, colony, 1);
          return undefined;
        }));
    }
    if (decreasable.length > 0) {
      options.options.push(new SelectColony('Select a colony tile track to move down', 'Move down', decreasable)
        .andThen((colony) => {
          colony.decreaseTrack();
          LogHelper.logColonyTrackDecrease(player, colony);
          return undefined;
        }));
    }
    if (options.options.length === 1) {
      return options.options[0];
    }
    return options;
  }
}
