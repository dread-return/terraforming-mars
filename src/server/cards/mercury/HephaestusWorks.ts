import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class HephaestusWorks extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HEPHAESTUS_WORKS,
      tags: [Tag.BUILDING, Tag.MERCURY],
      startingMegaCredits: 45,
      behavior: {
        production: {steel: 2},
      },
      firstAction: {
        text: 'Reveal cards until you reveal one with a Mercury tag, and take it',
        drawCard: {count: 1, tag: Tag.MERCURY},
      },
      metadata: {
        cardNumber: 'MMC01',
        description: 'You start with 45 M€ and 2 steel production. First action: reveal cards until a Mercury tag; take it.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).production((pb) => pb.steel(2)).cards(1, {secondaryTag: Tag.MERCURY});
          b.br;
          b.effect('Steel (2 M€ each) pays for Mercury cards, space events and ANY action that places a colony.', (eb) => {
            eb.tag(Tag.MERCURY, {size: Size.SMALL}).slash().tag(Tag.SPACE, {size: Size.SMALL}).asterix().slash().colonies(1, {size: Size.SMALL}).startEffect.steel(1).equals().megacredits(2);
          }).br;
        }),
      },
    });
  }
}
