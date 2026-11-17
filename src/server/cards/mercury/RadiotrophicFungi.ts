import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Units} from '../../../common/Units';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';

export class RadiotrophicFungi extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.RADIOTROPHIC_FUNGI,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER, Tag.MICROBE, Tag.MERCURY],
      cost: 16,
      requirements: {tag: Tag.MICROBE, count: 3},
      metadata: {
        cardNumber: 'MM34',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(1).megacredits(1)).slash().city();
        }),
        description: 'Requires 3 microbe tags. Increase your energy and M€ production 1 step for each city you own.',
      },
    });
  }

  public productionBox(player: IPlayer): Units {
    const cities = player.game.board.getCities(player).length;
    return Units.of({energy: cities, megacredits: cities});
  }

  public override bespokePlay(player: IPlayer) {
    player.production.adjust(this.productionBox(player), {log: true});
    return undefined;
  }
}
