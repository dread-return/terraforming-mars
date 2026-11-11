import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class FloatingAerobats extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FLOATING_AEROBATS,
      tags: [Tag.ANIMAL, Tag.JOVIAN, Tag.VENUS],
      cost: 21,
      resourceType: CardResource.ANIMAL,
      requirements: {display: 'aerobatFloaters'},
      victoryPoints: {resourcesHere: {}, per: 4},
      action: {
        addResourcesToAnyCard: {count: 1, type: CardResource.FLOATER},
      },
      metadata: {
        cardNumber: 'E12',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you add floaters to a card, add 1 animal here.', (eb) => eb.resource(CardResource.FLOATER).startEffect.resource(CardResource.ANIMAL)).br;
          b.action('Add 1 floater to any card.', (eb) => eb.empty().startAction.resource(CardResource.FLOATER).asterix());
        }),
        description: 'Requires a Jovian card with at least 4 floaters and a different Venus card with at least 4 floaters. 1 VP per 4 animals here.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    const cards = player.getResourceCards(CardResource.FLOATER).filter((c) => c.resourceCount >= 4);
    const jovian = cards.filter((c) => c.tags.includes(Tag.JOVIAN));
    const venus = cards.filter((c) => c.tags.includes(Tag.VENUS));
    return jovian.some((j) => venus.some((v) => v !== j));
  }
  public onResourceAdded(player: IPlayer, card: ICard, count: number) {
    if (card.resourceType === CardResource.FLOATER && count > 0) {
      player.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
