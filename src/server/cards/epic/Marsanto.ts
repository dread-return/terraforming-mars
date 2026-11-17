import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class Marsanto extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MARSANTO,
      tags: [Tag.MICROBE],
      startingMegaCredits: 45,

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-MRS',
        description: 'You start with 45 M€ and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).production((pb) => pb.plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you gain any number of plants, gain the same amount of M€.', (eb) => {
              eb.plants(1).text('x').startEffect.megacredits(1, {text: 'x'});
            });
          });
        }),
      },
    });
  }

  // Plants gained during the action phase are in EpicHooks.onStockChange; produced plants are here.
  public onProductionPhase(player: IPlayer) {
    if (player.production.plants > 0) {
      player.stock.add(Resource.MEGACREDITS, player.production.plants, {log: true, from: {card: this}});
    }
  }
}
