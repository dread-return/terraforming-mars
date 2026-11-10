import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class SteelMonopoly extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STEEL_MONOPOLY,
      tags: [Tag.BUILDING],
      cost: 11,
      requirements: {tag: Tag.BUILDING, count: 3},
      victoryPoints: {tag: Tag.SCIENCE, per: 2, each: -1},
      behavior: {
        production: {steel: 1},
        steelValue: 1,
      },
      metadata: {
        cardNumber: 'E124',
        renderData: CardRenderer.builder((b) => {
          b.effect('Each steel you have is worth 1 M€ extra.', (eb) => eb.steel(1).startEffect.plus().megacredits(1)).br;
          b.effect('You may use steel to pay for the City standard project.', (eb) => eb.steel(1).startEffect.city().asterix()).br;
          b.production((pb) => pb.steel(1));
        }),
        description: 'Requires 3 building tags. Increase your steel production 1 step. -1 VP per 2 science tags you have.',
      },
    });
  }
}
