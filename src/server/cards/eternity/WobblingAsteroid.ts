import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class WobblingAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.WOBBLING_ASTEROID,
      tags: [Tag.VENUS, Tag.SPACE],
      cost: 15,
      behavior: {
        global: {venus: 1},
        production: {heat: 1},
        addResourcesToAnyCard: {count: 2, type: CardResource.FLOATER},
        removeAnyPlants: 3,
      },
      metadata: {
        cardNumber: 'E141',
        renderData: CardRenderer.builder((b) => {
          b.venus(1).production((pb) => pb.heat(1)).resource(CardResource.FLOATER, 2).asterix().br.minus().plants(3, {all});
        }),
        description: 'Raise Venus 1 step. Increase your heat production 1 step. Add 2 floaters to any card. Remove up to 3 plants from any player.',
      },
    });
  }
}
