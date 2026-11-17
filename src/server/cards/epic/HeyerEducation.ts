import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';

export class HeyerEducation extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HEYER_EDUCATION,
      tags: [Tag.EARTH, Tag.SCIENCE],
      startingMegaCredits: 48,
      resourceType: CardResource.SCIENCE,
      victoryPoints: {resourcesHere: {}, per: 2},

      action: {
        spend: {megacredits: 4},
        addResourcesToAnyCard: {type: CardResource.SCIENCE, count: 1},
      },

      metadata: {
        cardNumber: 'EP-HEY',
        description: 'You start with 48 M€. 1 VP for every 2 science resources on this card.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48).br;
          b.action('Spend 4 M€ to place a science resource on any card.', (eb) => {
            eb.megacredits(4).startAction.resource(CardResource.SCIENCE).asterix();
          });
        }),
      },
    });
  }
}
