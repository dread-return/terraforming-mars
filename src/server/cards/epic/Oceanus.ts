import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class Oceanus extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.OCEANUS,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 33,
      resourceType: CardResource.FLOATER,

      behavior: {
        production: {titanium: 1, heat: 2},
      },

      action: {
        addResourcesToAnyCard: {type: CardResource.FLOATER, count: 1},
      },

      metadata: {
        cardNumber: 'EP-OCN',
        description: 'You start with 33 M€, 1 titanium production and 2 heat production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(33).production((pb) => pb.titanium(1).heat(2));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Add a floater to ANY card.', (eb) => {
              eb.empty().startAction.resource(CardResource.FLOATER).asterix();
            });
            ce.vSpace(Size.TINY);
            ce.effect('Floaters here pay 3 M€ each for cards with a Jovian tag.', (eb) => {
              eb.tag(Tag.JOVIAN).startEffect.resource(CardResource.FLOATER).equals().megacredits(3);
            });
          });
        }),
      },
    });
  }
}
