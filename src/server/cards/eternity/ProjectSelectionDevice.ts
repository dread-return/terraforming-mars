import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {Size} from '../../../common/cards/render/Size';

export class ProjectSelectionDevice extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PROJECT_SELECTION_DEVICE,
      tags: [],
      cost: 7,
      victoryPoints: 1,
      behavior: {
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E32',
        renderData: CardRenderer.builder((b) => {
          b.text('Research phase (draft): instead of drafting 1 card, draft 2, gain 3 M€ and pass this card on.', {size: Size.SMALL, isBold: false}).br;
          b.cards(1);
        }),
        description: 'A special project (drafting games only). Draw a card when this enters play.',
      },
    });
  }

  /** Set when the device is used during a draft round so its owner skips the repick step. */
  public data: {gen?: number, round?: number, by?: string} = {};
}
