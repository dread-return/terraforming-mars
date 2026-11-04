import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class TwinPlanetCommerceNetwork extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TWIN_PLANET_COMMERCE_NETWORK,
      tags: [Tag.VENUS, Tag.EARTH],
      cost: 28,
      requirements: {floaters: 1},

      behavior: {
        tr: {cities: {where: 'offmars'}},
        addResourcesToAnyCard: {type: CardResource.FLOATER, count: 3},
      },

      metadata: {
        cardNumber: 'B44',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).slash().city({all}).asterix().br;
          b.resource(CardResource.FLOATER, 3).asterix();
        }),
        description: 'Requires that you have a floater. Raise your TR 1 step for each city in play that is not on Mars. Add 3 floaters to ANY card.',
      },
    });
  }
}
