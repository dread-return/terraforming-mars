import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {ActionCard} from '../ActionCard';
import {IProjectCard} from '../IProjectCard';
import {digit} from '../Options';

export class TerraformingChain extends ActionCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.TERRAFORMING_CHAIN,
      type: CardType.ACTIVE,
      tags: [Tag.MARS, Tag.VENUS, Tag.MERCURY],
      cost: 12,
      resourceType: CardResource.FLOATER,
      action: {
        or: {
          behaviors: [
            {
              title: 'Spend 2 steel to add 2 floaters to ANY Venus card',
              spend: {steel: 2},
              addResourcesToAnyCard: {type: CardResource.FLOATER, tag: Tag.VENUS, count: 2},
            },
            {
              title: 'Remove 2 floaters here to gain 3 plants and 3 heat',
              spend: {resourcesHere: 2},
              stock: {plants: 3, heat: 3},
            },
          ],
        },
      },
      metadata: {
        cardNumber: 'MM13',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 2 steel to add 2 floaters to ANY Venus card.', (ab) => {
            ab.steel(2).startAction.resource(CardResource.FLOATER, {amount: 2, secondaryTag: Tag.VENUS});
          }).br;
          b.or().br;
          b.action('Remove 2 floaters here to gain 3 plants and 3 heat.', (ab) => {
            ab.resource(CardResource.FLOATER, 2).startAction.plants(3).heat(3, {digit});
          });
        }),
      },
    });
  }
}
