import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardResource} from '../../../common/CardResource';

/** S14. */
export class SyntheticBrainCells extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SYNTHETIC_BRAIN_CELLS,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      cost: 13,
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 2},
      requirements: {party: PartyName.TRANSHUMANISTS},

      action: {
        spend: {megacredits: 2},
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 1},
      },

      metadata: {
        cardNumber: 'S14',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 M€ to add 1 microbe to any card.', (eb) => {
            eb.megacredits(2).startAction.resource(CardResource.MICROBE).asterix();
          });
        }),
        description: {
          text: 'Requires that Transhumanists are ruling or that you have 2 delegates there. 1 VP per 2 microbes here.',
          align: 'left',
        },
      },
    });
  }
}
