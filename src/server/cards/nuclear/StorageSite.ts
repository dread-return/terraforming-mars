import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {DiscardCards} from '../../deferredActions/DiscardCards';

export class StorageSite extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.STORAGE_SITE,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      cost: 19,
      requirements: {tag: Tag.RADIOACTIVE, count: 2},
      resourceType: CardResource.RADIATION,

      action: {
        or: {
          behaviors: [
            {title: 'Draw a card and add a radiation to ANY card', drawCard: 1, addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},
            {title: 'Remove 2 radiation here to draw 2 cards', spend: {resourcesHere: 2}, drawCard: 2},
          ],
        },
      },

      metadata: {
        cardNumber: 'N58',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw a card and add a radiation to ANY card.', (eb) => {
            eb.empty().startAction.cards(1).resource(CardResource.RADIATION).asterix();
          }).br;
          b.or().br;
          b.action('Remove 2 radiation here to draw 2 cards.', (eb) => {
            eb.resource(CardResource.RADIATION, 2).startAction.cards(2);
          }).br;
          b.minus().cards(1);
        }),
        description: 'Requires 2 radioactive tags. Discard a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new DiscardCards(player, 1, 1, 'Storage Site: select a card to discard'));
    return undefined;
  }
}
