import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class PlanetX extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.PLANET_X,
      tags: [Tag.SPACE],
      cost: 11,
      requirements: {tag: Tag.RADIOACTIVE, count: 3},
      behavior: {
        tr: 1,
        stock: {heat: {tag: Tag.SPACE, per: 2}},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 2},
      },

      metadata: {
        cardNumber: 'N66',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).nbsp.heat(1).slash().text('2').tag(Tag.SPACE).br;
          b.resource(CardResource.RADIATION, 2).asterix();
        }),
        description: 'Requires 3 radioactive tags. Raise your TR 1 step. Gain 1 heat for every 2 space tags you own. Add 2 radiation to ANY card.',
      },
    });
  }
}
