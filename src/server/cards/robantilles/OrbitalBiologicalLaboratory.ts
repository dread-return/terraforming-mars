import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';

export class OrbitalBiologicalLaboratory extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ORBITAL_BIOLOGICAL_LABORATORY,
      tags: [Tag.MICROBE, Tag.SPACE],
      cost: 10,
      resourceType: CardResource.MICROBE,

      action: {
        or: {
          behaviors: [
            {title: 'Add 2 microbes to this card', addResources: 2},
            {title: 'Remove 1 microbe from this card to gain 3 M€', spend: {resourcesHere: 1}, stock: {megacredits: 3}},
          ],
        },
      },

      metadata: {
        cardNumber: 'H59',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 2 microbes to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.MICROBE, 2);
          }).br;
          b.or().br;
          b.action('Remove a microbe from this card to gain 3 M€.', (eb) => {
            eb.resource(CardResource.MICROBE).startAction.megacredits(3);
          });
        }),
      },
    });
  }
}
