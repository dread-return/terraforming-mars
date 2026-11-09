import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class VenusianWanderer extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VENUSIAN_WANDERER,
      tags: [Tag.VENUS],
      cost: 8,
      resourceType: CardResource.FLOATER,
      requirements: {venus: 4},
      victoryPoints: {resourcesHere: {}, per: 3},

      metadata: {
        cardNumber: 'V93',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Venus tag, add a floater to any card.', (eb) => {
            eb.tag(Tag.VENUS).startEffect.resource(CardResource.FLOATER).asterix();
          }).br;
          b.vpText('1 VP for every 3 floaters on this card.');
        }),
        description: 'Requires 4% Venus.',
      },
    });
  }

  // The card doesn't say "including this", so its own Venus tag doesn't count.
  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.name === this.name) {
      return;
    }
    const count = player.tags.cardTagCount(card, Tag.VENUS);
    for (let i = 0; i < count; i++) {
      player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 1}));
    }
  }
}
