import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';

export class ScienceFair extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SCIENCE_FAIR,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 3,

      behavior: {
        drawCard: 2,
      },

      metadata: {
        cardNumber: 'I04',
        renderData: CardRenderer.builder((b) => {
          b.cards(2).nbsp.cards(1, {all}).asterix();
        }),
        description: 'Draw 2 cards. Every other player draws 1 card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const opponent of player.opponents) {
      opponent.drawCard();
    }
    return undefined;
  }
}
