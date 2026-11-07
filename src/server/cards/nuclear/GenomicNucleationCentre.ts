import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class GenomicNucleationCentre extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GENOMIC_NUCLEATION_CENTRE,
      tags: [Tag.MICROBE],
      cost: 6,
      resourceType: CardResource.MICROBE,

      action: {
        or: {
          behaviors: [
            {title: 'Add a microbe to this card', addResources: 1},
            {title: 'Remove 3 microbes here to draw a card and gain 2 M€', spend: {resourcesHere: 3}, drawCard: 1, stock: {megacredits: 2}},
          ],
        },
      },

      metadata: {
        cardNumber: 'N77',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a microbe to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.MICROBE);
          }).br;
          b.or().br;
          b.action('Remove 3 microbes here to draw a card and gain 2 M€.', (eb) => {
            eb.resource(CardResource.MICROBE, 3).startAction.cards(1).megacredits(2);
          });
        }),
      },
    });
  }
}
