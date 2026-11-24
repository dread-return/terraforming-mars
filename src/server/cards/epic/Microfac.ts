import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';

export class Microfac extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.MICROFAC,
      tags: [Tag.MICROBE],
      startingMegaCredits: 51,
      resourceType: CardResource.MICROBE,

      action: {
        addResourcesToAnyCard: {type: CardResource.MICROBE, count: 1},
      },

      metadata: {
        cardNumber: 'EP-MCF',
        description: 'You start with 51 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(51);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action('Add a microbe to ANY card.', (eb) => {
              eb.empty().startAction.resource(CardResource.MICROBE).asterix();
            });
            ce.vSpace(Size.TINY);
            ce.effect('Microbes here pay 3 M€ each for standard projects.', (eb) => {
              eb.text('std. projects', {size: Size.SMALL}).startEffect.resource(CardResource.MICROBE).equals().megacredits(3);
            });
          });
        }),
      },
    });
  }
}
