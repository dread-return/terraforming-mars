import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';

export class BraggingRights extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BRAGGING_RIGHTS,
      tags: [],
      cost: 5,
      victoryPoints: -1,
      behavior: {
        stock: {steel: 3, titanium: 1},
      },
      metadata: {
        cardNumber: 'E05',
        renderData: CardRenderer.builder((b) => {
          b.text('Highest TR alone:').tr(1).br;
          b.text('Highest M€ production alone:').production((pb) => pb.megacredits(1)).br;
          b.steel(3).titanium(1);
        }),
        description: 'If you alone have the highest TR, raise your TR 1 step. If you alone have the highest M\u20ac production, increase it 1 step. Gain 3 steel and 1 titanium.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const others = player.opponents;
    if (others.every((p) => p.terraformRating < player.terraformRating)) {
      player.increaseTerraformRating(1);
    }
    const mc = player.production.megacredits;
    if (others.every((p) => p.production.megacredits < mc)) {
      player.production.add(Resource.MEGACREDITS, 1, {log: true});
    }
    return undefined;
  }
}
