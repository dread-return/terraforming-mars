import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';
import {digit} from '../Options';

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
          b.cards(1).text('keep 5 free').steel(7, {digit}).titanium(7, {digit}).br;
          b.production((pb) => pb.megacredits(-2).steel(1).titanium(1).plants(1).energy(1).heat(1)).br;
          b.corpBox('effect-action', (ce) => {
            ce.effect('Steel and titanium may pay for the City standard project.', (eb) => eb.steel(1).slash().titanium(1).startEffect.city().asterix());
            ce.action('Gain 1 M€ per city tile on Mars.', (eb) => eb.empty().startAction.megacredits(1).slash().city({all}).asterix());
          });
        }),
        description: 'You start with 7 steel and 7 titanium, -2 M\u20ac production and +1 production of every other resource. Keep exactly 5 of your opening project cards, for free.',
      },
    });
  }
}
