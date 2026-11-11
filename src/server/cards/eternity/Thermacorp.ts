import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {digit} from '../Options';

export class Thermacorp extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.THERMACORP,
      tags: [],
      startingMegaCredits: 31,
      behavior: {
        production: {heat: 2},
      },
      action: {
        or: {
          behaviors: [
            {title: 'Spend 7 heat to raise the temperature 1 step and gain 2 M€', spend: {heat: 7}, global: {temperature: 1}, stock: {megacredits: 2}},
            {title: 'Spend 10 heat to raise your TR 1 step', spend: {heat: 10}, tr: 1},
          ],
        },
      },
      firstAction: {
        text: 'Raise the temperature 1 step',
        global: {temperature: 1},
      },
      metadata: {
        cardNumber: 'EC06',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.heat(2)).megacredits(31).temperature(1).asterix().br;
          b.action('7 heat: raise temperature 1 step, gain 2 M€.', (eb) => eb.heat(7, {digit}).startAction.temperature(1).megacredits(2)).br;
          b.action('10 heat: raise your TR 1 step.', (eb) => eb.heat(10, {digit}).startAction.tr(1));
        }),
        description: 'You start with 31 M\u20ac and 2 heat production. First action: raise the temperature.',
      },
    });
  }
}
