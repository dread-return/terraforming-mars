import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {ActHelpers} from '../../mercury/ActHelpers';

export class MiningRightsAcquisition extends ActCard {
  constructor() {
    super({
      name: CardName.MINING_RIGHTS_ACQUISITION,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      victoryBehavior: {production: {steel: 2}},
      metadata: {
        cardNumber: 'ACT45',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).production((pb) => pb.steel(2)).br.text('defeat:', {size: Size.SMALL}).production((pb) => pb.minus().steel(1));
        }),
        description: 'Targeted player requires steel production. Victory: increase your steel production 2 steps. Defeat: decrease your steel production 1 step.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.production.steel > 0;
  }

  public override defeat(defeated: IPlayer) {
    ActHelpers.lowerProduction(defeated, Resource.STEEL, 1);
  }
}
