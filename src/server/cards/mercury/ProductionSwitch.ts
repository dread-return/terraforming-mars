import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {SelectResource} from '../../inputs/SelectResource';
import {Units} from '../../../common/Units';
import {Resource} from '../../../common/Resource';

export class ProductionSwitch extends ActCard {
  constructor() {
    super({
      name: CardName.PRODUCTION_SWITCH,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.BUILDING],
      metadata: {
        cardNumber: 'ACT25',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().wild(2).nbsp.plus().wild(2)).asterix();
        }),
        description: 'Resolve (both): decrease any of your productions 2 steps and increase another production 2 steps.',
      },
    });
  }

  public override resolveFor(player: IPlayer) {
    player.defer(() => {
      const lowerable = Units.keys.filter((unit) => player.production.get(unit) - 2 >= (unit === Resource.MEGACREDITS ? -5 : 0));
      if (lowerable.length === 0) {
        return undefined;
      }
      return new SelectResource('Production Switch: decrease a production 2 steps', lowerable).andThen((lowered) => {
        player.production.add(lowered, -2, {log: true});
        player.defer(new SelectResource('Production Switch: increase another production 2 steps', Units.keys.filter((u) => u !== lowered)).andThen((raised) => {
          player.production.add(raised, 2, {log: true});
          return undefined;
        }));
        return undefined;
      });
    });
  }
}
