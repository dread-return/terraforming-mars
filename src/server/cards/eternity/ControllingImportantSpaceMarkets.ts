import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class ControllingImportantSpaceMarkets extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CONTROLLING_IMPORTANT_SPACE_MARKETS,
      tags: [Tag.GALACTIC],
      cost: 45,
      requirements: {tag: Tag.GALACTIC, count: 2},
      victoryPoints: 5,
      behavior: {
        production: {megacredits: 10},
      },
      metadata: {
        cardNumber: 'E59',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(10));
        }),
        description: 'Requires 2 Galactic tags. Increase your M\u20ac production 10 steps.',
      },
    });
  }
}
