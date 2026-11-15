import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {DrawCards} from '../../deferredActions/DrawCards';
import {PlayerInput} from '../../PlayerInput';
import {InfrastructureCard} from './InfrastructureCard';

export class ScienceFacility extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.SCIENCE_FACILITY, copy, {
      resourceType: CardResource.SCIENCE,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'HO57',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.energy(1).titanium(1).startAction.resource(CardResource.SCIENCE)).br;
          b.or().nbsp.action(undefined, (eb) => {
            eb.resource(CardResource.SCIENCE).startAction.text('4').cards(1).asterix();
          }).br;
          b.plainText('(Action: spend 1 energy and 1 titanium to add 1 science here, OR spend 1 science here to look at the top 4 cards and keep 1.)');
        }),
      },
    });
  }

  private canAdd(player: IPlayer): boolean {
    return player.energy >= 1 && player.titanium >= 1;
  }

  public canAct(player: IPlayer): boolean {
    return this.canAdd(player) || this.resourceCount > 0;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const add = new SelectOption('Spend 1 energy and 1 titanium to add a science resource here').andThen(() => {
      player.stock.deduct(Resource.ENERGY, 1);
      player.stock.deduct(Resource.TITANIUM, 1);
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    const look = new SelectOption('Spend a science resource here to look at the top 4 cards and keep 1').andThen(() => {
      player.removeResourceFrom(this, 1, {log: true});
      player.game.defer(DrawCards.keepSome(player, 4, {keepMax: 1}));
      return undefined;
    });
    const options: Array<SelectOption> = [];
    if (this.canAdd(player)) {
      options.push(add);
    }
    if (this.resourceCount > 0) {
      options.push(look);
    }
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options);
  }
}
