import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';

export class InVivoTesting extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.IN_VIVO_TESTING,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      cost: 0,
      requirements: {tag: Tag.SCIENCE},
      victoryPoints: -1,

      behavior: {
        or: {
          behaviors: [
            {
              title: 'Remove 3 microbes from any card',
              removeResourcesFromAnyCard: {type: CardResource.MICROBE, count: 3, source: 'all'},
            },
            {
              title: 'Remove 5 plants from any player',
              removeAnyPlants: 5,
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'I55',
        renderData: CardRenderer.builder((b) => {
          b.minus().resource(CardResource.MICROBE, {amount: 3, all, digit}).slash().minus().plants(5, {all, digit});
        }),
        description: 'Requires a science tag. Remove 3 microbes or 5 plants from a player.',
      },
    });
  }
}
