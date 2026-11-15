import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {MAX_COLONY_TRACK_POSITION} from '../../../common/constants';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {IColony} from '../../colonies/IColony';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectColony} from '../../inputs/SelectColony';
import {SelectOption} from '../../inputs/SelectOption';
import {PlayerInput} from '../../PlayerInput';
import {InfrastructureCard} from './InfrastructureCard';

/** Needs Colonies (it is only dealt when Colonies is in the game). */
export class Freighter extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.FREIGHTER, copy, {
      resourceType: CardResource.ORE,
      metadata: {
        cardNumber: 'HO23',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => {
            eb.colonies(1).text('-1').startAction.resource(CardResource.ORE).asterix();
          }).br;
          b.or().nbsp.action(undefined, (eb) => {
            eb.resource(CardResource.ORE).startAction.colonies(1).text('+1');
          }).br;
          b.plainText('(Action: lower a colony marker 1 step and add 1 ore here if there is none, OR spend 1 ore here to raise a colony marker 1 step.)');
        }),
      },
    });
  }

  private lowerable(player: IPlayer): Array<IColony> {
    return player.game.colonies.filter((c) => c.isActive && c.trackPosition > c.colonies.length);
  }

  private raisable(player: IPlayer): Array<IColony> {
    return player.game.colonies.filter((c) => c.isActive && c.trackPosition < MAX_COLONY_TRACK_POSITION);
  }

  public canAct(player: IPlayer): boolean {
    return this.lowerable(player).length > 0 || (this.resourceCount > 0 && this.raisable(player).length > 0);
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const lower = new SelectOption('Lower a colony marker 1 step').andThen(() => {
      return new SelectColony('Select the colony marker to lower', 'Lower', this.lowerable(player)).andThen((colony) => {
        colony.decreaseTrack(1);
        player.game.log('${0} lowered the ${1} colony marker 1 step', (b) => b.player(player).colony(colony));
        if (this.resourceCount === 0) {
          player.addResourceTo(this, {qty: 1, log: true});
        }
        return undefined;
      });
    });
    const raise = new SelectOption('Remove 1 ore here to raise a colony marker 1 step').andThen(() => {
      return new SelectColony('Select the colony marker to raise', 'Raise', this.raisable(player)).andThen((colony) => {
        player.removeResourceFrom(this, 1, {log: true});
        colony.increaseTrack(1);
        player.game.log('${0} raised the ${1} colony marker 1 step', (b) => b.player(player).colony(colony));
        return undefined;
      });
    });
    const options: Array<SelectOption> = [];
    if (this.lowerable(player).length > 0) {
      options.push(lower);
    }
    if (this.resourceCount > 0 && this.raisable(player).length > 0) {
      options.push(raise);
    }
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options);
  }
}
