import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class DiscoveryOfLifeOnMars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.DISCOVERY_OF_LIFE_ON_MARS,
      tags: [Tag.MARS, Tag.MICROBE],
      cost: 3,
      requirements: {tr: 23, max: true, all: true},
      behavior: {
        tr: 1,
      },
      metadata: {
        cardNumber: 'E63',
        renderData: CardRenderer.builder((b) => {
          b.tr(1);
        }),
        description: 'No player may have more than 23 TR. Raise your TR 1 step.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.players.every((p) => p.terraformRating <= 23);
  }
}
