import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class GestaltIntelligence extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GESTALT_INTELLIGENCE,
      tags: [Tag.WILD],
      cost: 12,
      requirements: {display: 'generation', count: 6, max: true},
      metadata: {
        cardNumber: 'E14',
        renderData: CardRenderer.builder((b) => {
          b.effect('At the end of the game, your wild tags count toward awards and tag-based VP.', (eb) => {
            eb.tag(Tag.WILD).startEffect.award().vpIcon();
          });
        }),
        description: 'Must be played in generation 6 or earlier.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.generation <= 6;
  }
}
