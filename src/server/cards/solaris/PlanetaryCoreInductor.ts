import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class PlanetaryCoreInductor extends ActionCard implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PLANETARY_CORE_INDUCTOR,
      tags: [Tag.MARS, Tag.SPACE, Tag.GALACTIC],
      cost: 41,
      requirements: {tag: Tag.SCIENCE, count: 7},
      victoryPoints: {tag: Tag.GALACTIC, each: 3},

      action: {global: {temperature: 1}},

      metadata: {
        cardNumber: 'S06',
        renderData: CardRenderer.builder((b) => {
          b.action('Raise the temperature 1 step.', (eb) => {
            eb.empty().startAction.temperature(1);
          }).br;
          b.vpText('3 VP for each Galactic tag you have, including this.');
        }),
        description: 'Requires 7 science tags.',
      },
    });
  }
}
