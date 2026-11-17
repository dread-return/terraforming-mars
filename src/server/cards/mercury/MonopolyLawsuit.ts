import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {ActHelpers} from '../../mercury/ActHelpers';

export class MonopolyLawsuit extends ActCard {
  constructor() {
    super({
      name: CardName.MONOPOLY_LAWSUIT,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.POWER],
      victoryBehavior: {production: {energy: 1, megacredits: 1}},
      metadata: {
        cardNumber: 'ACT50',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).production((pb) => pb.energy(1).megacredits(1)).br.text('defeat:', {size: Size.SMALL}).production((pb) => pb.minus().energy(1));
        }),
        description: 'Your energy production has to be lower than that of the targeted player. Victory: increase your energy and M€ production 1 step. Defeat: decrease your energy production 1 step.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.production.energy < other.production.energy;
  }

  public override defeat(defeated: IPlayer) {
    ActHelpers.lowerProduction(defeated, Resource.ENERGY, 1);
  }
}
