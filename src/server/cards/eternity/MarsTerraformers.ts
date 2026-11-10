import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class MarsTerraformers extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARS_TERRAFORMERS,
      tags: [Tag.MARS],
      cost: 6,
      behavior: {
        tr: 1,
      },
      metadata: {
        cardNumber: 'E23',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).br.text('Most Mars tags:').cards(1);
        }),
        description: 'Raise your TR 1 step. The player(s) with the most Mars tags in play draw a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const counts = player.game.players.map((p) => p.tags.count(Tag.MARS, 'raw') + (p === player ? 1 : 0));
    const max = Math.max(...counts);
    player.game.players.forEach((p, i) => {
      if (counts[i] === max) {
        p.drawCard();
      }
    });
    return undefined;
  }
}
