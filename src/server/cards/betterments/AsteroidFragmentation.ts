import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class AsteroidFragmentation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ASTEROID_FRAGMENTATION,
      tags: [Tag.SPACE],
      cost: 3,

      behavior: {
        tr: 3,
      },

      metadata: {
        cardNumber: 'B06',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(6).nbsp.minus().steel(3).nbsp.minus().titanium(3).nbsp.tr(3);
        }),
        description: 'Spend 6 heat, 3 steel and 3 titanium to raise your TR 3 steps.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.availableHeat() >= 6 && player.steel >= 3 && player.titanium >= 3;
  }

  public override bespokePlay(player: IPlayer) {
    player.stock.deduct(Resource.STEEL, 3);
    player.stock.deduct(Resource.TITANIUM, 3);
    // spendHeat lets players with heat stored elsewhere (e.g. Stormcraft) choose how to pay.
    return player.spendHeat(6);
  }
}
