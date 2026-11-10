import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class PatentValuationAdjustment extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PATENT_VALUATION_ADJUSTMENT,
      tags: [],
      cost: 7,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E99',
        renderData: CardRenderer.builder((b) => {
          b.effect('Gain 1 additional M€ for each card you sell with the Sell Patents standard project.', (eb) => eb.text('SELLING PATENTS').startEffect.plus().megacredits(1));
        }),
      },
    });
  }
}
