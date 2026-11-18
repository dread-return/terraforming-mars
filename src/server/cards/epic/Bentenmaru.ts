import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class Bentenmaru extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BENTENMARU,
      tags: [Tag.EARTH],
      startingMegaCredits: 25,

      behavior: {
        production: {megacredits: 10},
      },

      metadata: {
        cardNumber: 'EP-BEN',
        description: 'You start with 25 M€ and 10 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(25).production((pb) => pb.megacredits(10));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When another player would lower your resources or production, raise them by that amount instead.', (eb) => {
              eb.minus().wild(1, {all}).asterix().startEffect.plus().wild(1);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Each generation, when you pass, discard all your remaining M€.', (eb) => {
              eb.text('pass').startEffect.minus().megacredits(1, {text: 'all'});
            });
          });
        }),
      },
    });
  }
  // Effects are in EpicHooks (onStockChange, onProductionChange, onCardResourceRemoved, onPass).
}
