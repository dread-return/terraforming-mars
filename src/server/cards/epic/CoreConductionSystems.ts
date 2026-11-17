import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
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
          b.megacredits(40).production((pb) => pb.heat(2)).br;
          b.effect('Whenever you gain steps of heat or energy production, including this, gain that many heat or energy resources.', (eb) => {
            eb.production((pb) => pb.heat(1)).slash().production((pb) => pb.energy(1)).startEffect.heat(1).slash().energy(1);
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
