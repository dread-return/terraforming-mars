import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class SyndicatDesTravailleursMartiens extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SYNDICAT_DES_TRAVAILLEURS_MARTIENS,
      tags: [Tag.POWER, Tag.BUILDING],
      startingMegaCredits: 40,

      behavior: {
        production: {steel: 1, energy: 1},
      },

      metadata: {
        cardNumber: 'EP-STM',
        description: 'You start with 40 M€, 1 steel production and 1 energy production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(40).production((pb) => pb.steel(1).energy(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Before each production, choose a base resource not chosen yet: other players produce 5 less of it. After all six, start over.', (eb) => {
              eb.plate('Production').startEffect.text('-5').wild(1, {all}).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {chosen?: Array<Resource>, current?: Resource} = {};
  // Effect is in EpicHooks.beforeProductionPhase / afterProduction.
}
