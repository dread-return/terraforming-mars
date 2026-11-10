import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class VenusDevelopmentContract extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.VENUS_DEVELOPMENT_CONTRACT,
      tags: [Tag.BUILDING, Tag.VENUS, Tag.VENUS],
      cost: 24,
      requirements: {venus: 12},
      behavior: {
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E137',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).venus(1).slash().tag(Tag.VENUS, 2);
        }),
        description: 'Requires 12% Venus. Draw a card. Raise Venus 1 step for every 2 Venus tags you have, including these.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const steps = Math.floor((player.tags.count(Tag.VENUS) + 2) / 2);
    for (let i = 0; i < steps; i++) {
      player.game.increaseVenusScaleLevel(player, 1);
    }
    return undefined;
  }
}
