import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class SeedSharing extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SEED_SHARING,
      tags: [Tag.PLANT, Tag.SCIENCE],
      cost: 17,

      behavior: {
        production: {plants: 2},
      },

      metadata: {
        cardNumber: 'B33',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(2)).nbsp.plants(2, {all});
        }),
        description: 'Requires that any player has plant production. Increase your plant production 2 steps. Every player gains 2 plants.',
      },
    });
  }

  // A plant production requirement can't be declared directly (see ProductionRequirement).
  public override bespokeCanPlay(player: IPlayer) {
    return player.game.players.some((p) => p.production.plants >= 1);
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      p.stock.add(Resource.PLANTS, 2, {log: true});
    }
    return undefined;
  }
}
