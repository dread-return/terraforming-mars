import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {all, digit} from '../Options';

export class GeneralistTerraforma extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.GENERALIST_TERRAFORMA,
      tags: [Tag.BUILDING, Tag.CITY],
      startingMegaCredits: 0,
      cardCost: 0,
      behavior: {
        stock: {steel: 7, titanium: 7},
        production: {megacredits: -2, steel: 1, titanium: 1, plants: 1, energy: 1, heat: 1},
      },
      action: {
        stock: {megacredits: {cities: {where: 'onmars'}, all: true}},
      },
      metadata: {
        cardNumber: 'EC11',
        renderData: CardRenderer.builder((b) => {
          b.steel(7, {digit}).titanium(7, {digit}).nbsp.text('5 free cards', {size: Size.SMALL}).br;
          b.production((pb) => pb.megacredits(-2).steel(1).titanium(1).plants(1).energy(1).heat(1)).br;
          b.effect('Steel & titanium pay for the City SP.', (eb) => eb.steel(1).slash().titanium(1).startEffect.city().asterix()).br;
          b.action('Gain 1 M€ for each city ON MARS.', (eb) => eb.empty().startAction.megacredits(1).slash().city({all}).asterix());
        }),
      },
    });
  }
}
