import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class ITERFunding extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ITER_FUNDING,
      tags: [Tag.POWER, Tag.EARTH],
      cost: 15,
      requirements: {tag: Tag.EARTH, count: 6, all},
      behavior: {production: {megacredits: 2, energy: 1, heat: 1}},

      metadata: {
        cardNumber: 'N22',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2).energy(1).heat(1)).nbsp.megacredits(1, {all}).asterix();
        }),
        description: 'Requires 6 Earth tags in play. Increase your M€ production 2 steps and your heat and energy production 1 step. Get 1 M€ from each opponent.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      if (opponent.megaCredits > 0) {
        opponent.stock.steal(Resource.MEGACREDITS, 1, player, {log: true});
      }
    }
    return undefined;
  }
}
