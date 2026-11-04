import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';

export class DataLibrary extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.DATA_LIBRARY,
      tags: [Tag.SCIENCE],
      cost: 3,
      resourceType: CardResource.DATA,

      metadata: {
        cardNumber: 'H54',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a data resource to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.DATA);
          }).br;
          b.effect('Whenever there are 2 data here, remove them to draw a card.', (eb) => {
            eb.resource(CardResource.DATA, 2).startEffect.cards(1);
          });
        }),
      },
    });
  }

  public canAct() {
    return true;
  }

  public action(player: IPlayer) {
    player.addResourceTo(this, {qty: 1, log: true});
    return undefined;
  }

  public onResourceAdded(player: IPlayer, card: ICard) {
    if (card !== this) {
      return;
    }
    while (this.resourceCount >= 2) {
      player.removeResourceFrom(this, 2);
      player.drawCard();
    }
  }
}
