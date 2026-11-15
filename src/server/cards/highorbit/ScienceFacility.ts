import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
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
      tags: [Tag.SCIENCE],
      resourceType: CardResource.SCIENCE,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'INF20',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.titanium(1).energy(1).startAction.resource(CardResource.SCIENCE).asterix()).br;
          b.or().nbsp.action(undefined, (eb) => {
            eb.resource(CardResource.SCIENCE).startAction.text('4').cards(1).asterix();
          }).br;
          b.plainText('(Action: spend 1 titanium and 1 energy to add a science resource to ANY card, OR spend 1 science here to draw 4 cards, keep 1 and discard the rest.)');
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
    const add = new SelectOption('Spend 1 titanium and 1 energy to add a science resource to any card').andThen(() => {
      player.stock.deduct(Resource.ENERGY, 1);
      player.stock.deduct(Resource.TITANIUM, 1);
      player.game.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: 1}));
      return undefined;
    });
    const look = new SelectOption('Spend a science resource here to draw 4 cards and keep 1').andThen(() => {
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
