import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class ExhaustedBars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.EXHAUSTED_BARS,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 14,
      requirements: [{tag: Tag.RADIOACTIVE}, {tag: Tag.POWER}, {tag: Tag.SCIENCE}],
      behavior: {
        decreaseAnyProduction: {type: Resource.TITANIUM, count: 1},
        production: {steel: 1, energy: 1},
      },

      metadata: {
        cardNumber: 'N42',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().titanium(1, {all}).br.plus().steel(1).energy(1));
        }),
        description: 'Requires a radioactive, a power and a science tag. Decrease any titanium production 1 step and increase your steel and energy production 1 step.',
      },
    });
  }
}
