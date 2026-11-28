import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';

/** The titanium for spending energy is in EpicHooks.onStockChange. */
export class UnionAerospace extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.UNION_AEROSPACE,
      tags: [Tag.POWER],
      startingMegaCredits: 38,
      behavior: {
        production: {energy: 3},
      },
      action: {
        spend: {energy: 4},
        tr: 1,
      },

      metadata: {
        cardNumber: 'EP-UAC',
        description: 'You start with 3 energy production and 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.production((pb) => pb.energy(3)).nbsp.megacredits(38);
          b.br;
          b.effect('When you spend energy, gain 1 titanium.', (eb) => {
            eb.minus().energy(1).asterix().startEffect.titanium(1);
          }).br;
          b.action('Spend 4 energy to raise your TR 1 step.', (eb) => {
            eb.energy(4).startAction.tr(1);
          }).br;
        }),
      },
    });
  }
}
