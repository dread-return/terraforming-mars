import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {ActHelpers} from '../../mercury/ActHelpers';

export class ModernFuels extends ActCard {
  constructor() {
    super({
      name: CardName.MODERN_FUELS,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.POWER],
      metadata: {
        cardNumber: 'ACT30',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(1).nbsp.plus().titanium(1).energy(1));
        }),
        description: 'Resolve (both): decrease your M€ production 1 step. Increase your titanium and energy production 1 step.',
      },
    });
  }

  public override resolveFor(player: IPlayer) {
    ActHelpers.lowerProduction(player, Resource.MEGACREDITS, 1);
    player.production.add(Resource.TITANIUM, 1, {log: true});
    player.production.add(Resource.ENERGY, 1, {log: true});
  }
}
