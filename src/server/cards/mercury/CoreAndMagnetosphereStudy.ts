import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class CoreAndMagnetosphereStudy extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.CORE_AND_MAGNETOSPHERE_STUDY,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE, Tag.MERCURY],
      cost: 16,
      behavior: {
        production: {steel: 2},
        global: {temperature: 1},
      },
      metadata: {
        cardNumber: 'MM03',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.steel(2)).temperature(1);
        }),
        description: 'Increase your steel production 2 steps. Raise temperature 1 step.',
      },
    });
  }
}
