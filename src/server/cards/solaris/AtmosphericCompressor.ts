import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class AtmosphericCompressor extends ActionCard implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ATMOSPHERIC_COMPRESSOR,
      tags: [Tag.SCIENCE, Tag.SPACE, Tag.GALACTIC],
      cost: 43,
      requirements: {tag: Tag.SPACE, count: 7},
      victoryPoints: {tag: Tag.GALACTIC, each: 3},

      action: {global: {oxygen: 1}},

      metadata: {
        cardNumber: 'S02',
        renderData: CardRenderer.builder((b) => {
          b.action('Raise the oxygen 1 step.', (eb) => {
            eb.empty().startAction.oxygen(1);
          }).br;
          b.vpText('3 VP for each Galactic tag you have, including this.');
        }),
        description: 'Requires 7 space tags.',
      },
    });
  }
}
