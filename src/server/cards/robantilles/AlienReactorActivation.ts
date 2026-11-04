import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class AlienReactorActivation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ALIEN_REACTOR_ACTIVATION,
      tags: [],
      cost: 16,

      behavior: {
        or: {
          behaviors: [
            {title: 'Raise temperature 1 step', global: {temperature: 1}},
            {title: 'Raise oxygen 1 step', global: {oxygen: 1}},
          ],
        },
        tr: 1,
      },

      metadata: {
        cardNumber: 'H11',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).or().oxygen(1).br;
          b.tr(1);
        }),
        description: 'Raise the temperature OR oxygen 1 step. Raise your TR 1 step.',
      },
    });
  }
}
