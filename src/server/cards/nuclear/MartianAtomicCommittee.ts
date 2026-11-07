import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Nuclear} from './Nuclear';
import {all} from '../Options';

export class MartianAtomicCommittee extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARTIAN_ATOMIC_COMMITTEE,
      tags: [Tag.RADIOACTIVE, Tag.POWER],
      cost: 13,
      requirements: {tag: Tag.RADIOACTIVE, count: 2},
      behavior: {
        decreaseAnyProduction: {type: Resource.MEGACREDITS, count: 1},
        production: {megacredits: 1, energy: 1},
      },

      metadata: {
        cardNumber: 'N32',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().megacredits(1, {all}).br.plus().megacredits(1).energy(1)).br;
          b.megacredits(1).slash().resource(CardResource.RADIATION, 3);
        }),
        description: 'Requires 2 radioactive tags. Decrease an opponent\'s M€ production 1 step. Increase your M€ and energy production 1 step. ' +
          'Gain 1 M€ for every 3 radiation you have.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const gain = Math.floor(Nuclear.radiationCount(player) / 3);
    if (gain > 0) {
      player.stock.add(Resource.MEGACREDITS, gain, {log: true});
    }
    return undefined;
  }
}
