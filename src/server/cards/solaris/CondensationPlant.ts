import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

export class CondensationPlant extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CONDENSATION_PLANT,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 14,
      requirements: {party: PartyName.KELVINISTS},

      metadata: {
        cardNumber: 'S17',
        renderData: CardRenderer.builder((b) => {
          b.effect('During the production phase, gain 1 extra heat for each energy converted into heat.', (eb) => {
            eb.production((pb) => pb.energy(1)).startEffect.plus().heat(1);
          });
        }),
        description: 'Requires that Kelvinists are ruling or that you have 2 delegates there.',
      },
    });
  }
}
