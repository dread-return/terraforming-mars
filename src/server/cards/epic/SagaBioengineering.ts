import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class SagaBioengineering extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.SAGA_BIOENGINEERING,
      tags: [Tag.ANIMAL],
      startingMegaCredits: 43,
      resourceType: CardResource.ANIMAL,

      behavior: {
        global: {oxygen: 2},
      },

      action: {
        addResourcesToAnyCard: {type: CardResource.ANIMAL, count: 1},
      },

      metadata: {
        cardNumber: 'EP-SAG',
        description: 'You start with 43 M€ and raise the oxygen 2 steps.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43).plus().oxygen(2);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Add a animal to ANY card.', (eb) => {
              eb.empty().startAction.resource(CardResource.ANIMAL).asterix();
            });
            ce.vSpace(Size.TINY);
            ce.effect('Animals here pay 3 M€ each for cards with an animal tag.', (eb) => {
              eb.tag(Tag.ANIMAL).startEffect.resource(CardResource.ANIMAL).equals().megacredits(3);
            });
          });
        }),
      },
    });
  }
}
