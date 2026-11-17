import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class HephaestusWorks extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HEPHAESTUS_WORKS,
      tags: [Tag.BUILDING, Tag.MERCURY],
      startingMegaCredits: 45,
      behavior: {
        production: {steel: 3},
      },
      metadata: {
        cardNumber: 'MMC01',
        description: 'You start with 45 M€. Increase your steel production 3 steps.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).production((pb) => pb.steel(3));
          b.corpBox('effect', (ce) => {
            ce.effect('You can use your steel (2 M€ each) to pay for cards with a Mercury tag, events with a space tag, and ANY action that places a colony.', (eb) => {
              eb.tag(Tag.MERCURY).slash().tag(Tag.SPACE).asterix().slash().colonies(1).startEffect.steel(1).equals().megacredits(2);
            });
          });
        }),
      },
    });
  }
}
