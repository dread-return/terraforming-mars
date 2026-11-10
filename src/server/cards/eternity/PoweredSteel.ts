import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class PoweredSteel extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.POWERED_STEEL,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 29,
      victoryPoints: 1,
      behavior: {
        production: {energy: 2, steel: 2},
      },
      metadata: {
        cardNumber: 'E104',
        renderData: CardRenderer.builder((b) => {
          b.effect('You may use energy as M€.', (eb) => eb.energy(1, {text: 'x'}).startEffect.megacredits(0, {text: 'x'})).br;
          b.production((pb) => pb.energy(2).steel(2));
        }),
        description: 'Increase your energy and steel production 2 steps each.',
      },
    });
  }
}
