import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Size} from '../../../common/cards/render/Size';

export class PriceManipulationSubsidies extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.PRICE_MANIPULATION_SUBSIDIES,
      tags: [],
      cost: 2,
      requirements: {display: 'generation', count: 7, max: true},
      metadata: {
        cardNumber: 'E31',
        renderData: CardRenderer.builder((b) => {
          b.text('This production phase, ALL players get 2 M€ instead of each steel, titanium, plant, energy and heat they would produce.', {size: Size.SMALL, isBold: false});
        }),
        description: 'Must be played in generation 7 or earlier.',
      },
    });
  }

  public data: {gen?: number} = {};
  public override bespokeCanPlay(player: IPlayer) {
    return player.game.generation <= 7;
  }
  public override bespokePlay(player: IPlayer) {
    this.data = {gen: player.game.generation};
    return undefined;
  }
}
