import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class UraniumEnrichmentFacility extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.URANIUM_ENRICHMENT_FACILITY,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.BUILDING],
      cost: 9,
      resourceType: CardResource.RADIATION,
      // VP badge 1/4 (card text says 1/3). Following the icon.
      victoryPoints: {resourcesHere: {}, per: 4},

      action: {
        or: {
          behaviors: [
            {title: 'Spend 1 steel to add a radiation to ANY card', spend: {steel: 1}, addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},
            {title: 'Spend 1 titanium to add a radiation to ANY card', spend: {titanium: 1}, addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N16',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 steel or 1 titanium to add a radiation to ANY card.', (eb) => {
            eb.steel(1).slash().titanium(1).startAction.resource(CardResource.RADIATION).asterix();
          }).br;
          b.vpText('1 VP for every 4 radiation on this card.');
        }),
      },
    });
  }
}
