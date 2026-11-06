import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class GreatLeapForward extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GREAT_LEAP_FORWARD,
      cost: 24,
      requirements: {chairman: {}},

      behavior: {
        global: {oxygen: 1, temperature: 1},
        ocean: {},
      },

      metadata: {
        cardNumber: 'I50',
        renderData: CardRenderer.builder((b) => {
          b.oxygen(1).temperature(1).oceans(1);
        }),
        description: 'Requires that you are the chairman. Raise oxygen and temperature 1 step and place an ocean tile.',
      },
    });
  }
}
