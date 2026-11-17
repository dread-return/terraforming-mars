import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {ActHelpers} from '../../mercury/ActHelpers';

export class InequalityFund extends ActCard {
  constructor() {
    super({
      name: CardName.INEQUALITY_FUND,
      kind: 'rivalry',
      steps: [4, 5],
      tags: [],
      victoryBehavior: {production: {megacredits: 3}},
      metadata: {
        cardNumber: 'ACT44',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).production((pb) => pb.megacredits(3)).br.text('defeat:', {size: Size.SMALL}).production((pb) => pb.minus().megacredits(2));
        }),
        description: 'Your M€ production has to be lower than that of the targeted player. Victory: increase your M€ production 3 steps. Defeat: decrease your M€ production 2 steps.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.production.megacredits < other.production.megacredits;
  }

  public override defeat(defeated: IPlayer) {
    ActHelpers.lowerProduction(defeated, Resource.MEGACREDITS, 2);
  }
}
