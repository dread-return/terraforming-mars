import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {max} from '../Options';

export class ThoriumReactor extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.THORIUM_REACTOR,
      tags: [Tag.RADIOACTIVE, Tag.POWER],
      cost: 11,
      requirements: {temperature: -8, max},
      victoryPoints: {tag: Tag.RADIOACTIVE, per: 2},
      behavior: {production: {energy: 1, heat: 1}},

      metadata: {
        cardNumber: 'N24',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1).heat(1));
        }),
        description: 'Requires -8 °C or colder. Increase your energy and heat production 1 step. 1 VP for every 2 radioactive tags you own.',
      },
    });
  }
}
