import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class TerraformingMarsCard extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TERRAFORMING_MARS_E,
      tags: [Tag.MARS],
      cost: 20,
      behavior: {
        tr: 1,
      },
      metadata: {
        cardNumber: 'E129',
        renderData: CardRenderer.builder((b) => {
          b.effect('Your cost of buying cards is reduced by 1 M€.', (eb) => eb.cards(1).startEffect.megacredits(-1)).br.tr(1).text('GEN 9+:').tr(1);
        }),
        description: 'Raise your TR 1 step. If you play this in generation 9 or later, raise it another step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.cardCost = Math.max(0, player.cardCost - 1);
    if (player.game.generation >= 9) {
      player.increaseTerraformRating(1);
    }
    return undefined;
  }
}
