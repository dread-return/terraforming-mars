import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class DeepMachineLearningAlgorithms extends PreludeCard {
  constructor() {
    super({
      name: CardName.DEEP_MACHINE_LEARNING_ALGORITHMS,
      tags: [Tag.WILD],
      victoryPoints: 4,
      metadata: {
        cardNumber: 'EP10',
        renderData: CardRenderer.builder((b) => {
          b.vpText('4 VP.');
        }),
      },
    });
  }
}
