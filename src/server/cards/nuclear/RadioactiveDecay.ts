import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class RadioactiveDecay extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.RADIOACTIVE_DECAY,
      tags: [Tag.RADIOACTIVE, Tag.SCIENCE, Tag.EARTH],
      cost: 15,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},
      behavior: {production: {megacredits: 1}},

      action: {
        or: {
          behaviors: [
            {title: 'Add a radiation to ANY card', addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},
            {title: 'Remove a radiation here to gain 1 steel and 1 heat', spend: {resourcesHere: 1}, stock: {steel: 1, heat: 1}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N52',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a radiation to ANY card.', (eb) => {
            eb.empty().startAction.resource(CardResource.RADIATION).asterix();
          }).br;
          b.or().br;
          b.action('Remove a radiation here to gain 1 steel and 1 heat.', (eb) => {
            eb.resource(CardResource.RADIATION).startAction.steel(1).heat(1);
          }).br;
          b.production((pb) => pb.megacredits(1));
        }),
        description: 'Increase your M€ production 1 step. 1 VP for every 4 radiation on this card.',
      },
    });
  }
}
