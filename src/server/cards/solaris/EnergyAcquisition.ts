import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';

/** S30. */
export class EnergyAcquisition extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ENERGY_ACQUISITION,
      tags: [],
      cost: 1,
      requirements: {party: PartyName.EMPOWER},

      behavior: {
        stock: {energy: 6},
      },

      metadata: {
        cardNumber: 'S30',
        renderData: CardRenderer.builder((b) => {
          b.energy(6);
        }),
        description: 'Requires that Empower are ruling or that you have 2 delegates there. Gain 6 energy.',
      },
    });
  }
}
