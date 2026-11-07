import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';

export class CosmicRayAnalysis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COSMIC_RAY_ANALYSIS,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 11,
      behavior: {
        production: {heat: -1, titanium: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: {tag: Tag.RADIOACTIVE, per: 2}},
      },

      metadata: {
        cardNumber: 'N12',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().heat(1).br.plus().titanium(1)).nbsp.resource(CardResource.RADIATION).asterix().slash().tag(Tag.RADIOACTIVE, 2);
        }),
        description: 'Decrease your heat production 1 step and increase your titanium production 1 step. ' +
          'Add a radiation to ANY card for every 2 radioactive tags you own, including this.',
      },
    });
  }
}
