import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';

export class SharedDeposits extends ActCard {
  constructor() {
    super({
      name: CardName.SHARED_DEPOSITS,
      kind: 'treaty',
      steps: 7,
      tags: [],
      bothBehavior: {production: {steel: 2}, stock: {steel: 2}},
      metadata: {
        cardNumber: 'ACT06',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(2)).steel(2);
        }),
        description: 'Resolve (both): increase your steel production 2 steps and gain 2 steel.',
      },
    });
  }
}
