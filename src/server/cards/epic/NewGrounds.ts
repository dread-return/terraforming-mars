import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class NewGrounds extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.NEW_GROUNDS,
      tags: [Tag.BUILDING],
      startingMegaCredits: 35,

      behavior: {
        stock: {steel: 5},
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-NGR',
        description: 'You start with 35 M€, 5 steel and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(35).steel(5, {digit}).production((pb) => pb.plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('You may place cities and greeneries ignoring the normal placement rules (not on reserved areas).', (eb) => {
              eb.city({size: Size.SMALL}).greenery({size: Size.SMALL}).startEffect.emptyTile('normal', {size: Size.SMALL}).text('anywhere', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }
  // Placement is in MarsBoard (EpicHooks.ignoresCityPlacement / ignoresGreeneryPlacement).
}
