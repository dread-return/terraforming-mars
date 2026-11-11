import {ActionCard} from '../ActionCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class SpaceBears extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SPACE_BEARS,
      tags: [Tag.ANIMAL, Tag.MICROBE, Tag.SPACE],
      cost: 8,
      resourceType: CardResource.ANIMAL,
      requirements: [{tag: Tag.ANIMAL}, {tag: Tag.MICROBE}, {tag: Tag.SPACE}],
      victoryPoints: {resourcesHere: {}, per: 2},
      behavior: {
        drawCard: 1,
      },
      action: {
        addResourcesToAnyCard: {count: 1, type: CardResource.ANIMAL},
      },
      metadata: {
        cardNumber: 'E119',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a microbe tag, including this, add 1 animal here.', (eb) => eb.tag(Tag.MICROBE).startEffect.resource(CardResource.ANIMAL)).br;
          b.action('Add an animal to any card.', (eb) => eb.empty().startAction.resource(CardResource.ANIMAL).asterix()).br;
          b.cards(1);
        }),
        description: 'Draw a card.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.MICROBE).length;
    if (n > 0) {
      player.addResourceTo(this, {qty: n, log: true});
    }
    return undefined;
  }
}
