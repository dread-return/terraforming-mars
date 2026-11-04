import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class JovianBeltMiningOperations extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.JOVIAN_BELT_MINING_OPERATIONS,
      tags: [Tag.JOVIAN, Tag.SPACE],
      cost: 19,
      victoryPoints: 2,

      behavior: {
        production: {titanium: 2},
      },

      metadata: {
        cardNumber: 'B10',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.titanium(2).nbsp.titanium(1, {all}));
        }),
        description: 'Increase your titanium production 2 steps. Each other player increases their titanium production 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      opponent.production.add(Resource.TITANIUM, 1, {log: true});
    }
    return undefined;
  }
}
