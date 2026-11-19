import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class CoreConductionSystems extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CORE_CONDUCTION_SYSTEMS,
      tags: [Tag.BUILDING, Tag.POWER],
      startingMegaCredits: 40,
      behavior: {
        production: {heat: 2},
      },

      metadata: {
        cardNumber: 'EP-CCS',
        description: 'You start with 40 M€ and 2 heat production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).production((pb) => pb.heat(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you gain heat or energy production, also gain that many heat or energy.', (eb) => {
              eb.production((pb) => pb.heat(1).slash().energy(1)).startEffect.heat(1).slash().energy(1);
            });
          });
        }),
      },
    });
  }

  public onProductionGain(player: IPlayer, resource: Resource, amount: number) {
    if (amount > 0 && (resource === Resource.HEAT || resource === Resource.ENERGY)) {
      player.stock.add(resource, amount, {log: true, from: {card: this}});
    }
  }
}
