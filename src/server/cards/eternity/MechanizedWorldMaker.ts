import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MechanizedWorldMaker extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MECHANIZED_WORLD_MAKER,
      tags: [Tag.BUILDING, Tag.SCIENCE],
      cost: 3,
      requirements: [{tag: Tag.BUILDING}, {tag: Tag.SCIENCE}],
      victoryPoints: 1,
      behavior: {
        production: {energy: -1},
      },
      metadata: {
        cardNumber: 'E28',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may use steel to pay for standard projects.', (eb) => eb.steel(1).startEffect.text('standard projects'));
          b.br.production((pb) => pb.minus().energy(1));
        }),
        description: 'Requires a building tag and a science tag. Decrease your energy production 1 step.',
      },
    });
  }
}
