import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';

export class MercuryEngineeringSchool extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MERCURY_ENGINEERING_SCHOOL,
      type: CardType.ACTIVE,
      tags: [Tag.SCIENCE, Tag.BUILDING, Tag.MERCURY],
      cost: 16,
      victoryPoints: 1,
      behavior: {
        drawCard: {count: 2, tag: Tag.BUILDING},
      },
      metadata: {
        cardNumber: 'MM19',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any player plays a Mercury tag, including this, draw a card.', (eb) => {
            eb.tag(Tag.MERCURY, {all}).startEffect.cards(1);
          }).br;
          b.cards(2, {secondaryTag: Tag.BUILDING});
        }),
        description: 'Draw 2 cards with a building tag.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.MERCURY).length;
    if (count > 0) {
      thisCardOwner.drawCard(count);
    }
    return undefined;
  }
}
