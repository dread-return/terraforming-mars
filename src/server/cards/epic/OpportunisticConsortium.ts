import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class OpportunisticConsortium extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OPPORTUNISTIC_CONSORTIUM,
      tags: [Tag.WILD],
      startingMegaCredits: 50,

      metadata: {
        cardNumber: 'EP-OPC',
        description: 'You start with 50 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(50);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When an opponent\'s production of a resource decreases X steps, gain X of that resource.', (eb) => {
              eb.production((pb) => pb.minus().wild(1, {all}).text('x')).startEffect.wild(1).text('x');
            });
          });
        }),
      },
    });
  }
  // Effect is in EpicHooks.onProductionChange.
}
