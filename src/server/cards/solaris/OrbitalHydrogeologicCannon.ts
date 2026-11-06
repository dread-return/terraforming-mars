import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

export class OrbitalHydrogeologicCannon extends ActionCard implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ORBITAL_HYDROGEOLOGIC_CANNON,
      tags: [Tag.RADIOACTIVE, Tag.SPACE, Tag.GALACTIC],
      cost: 53,
      victoryPoints: {tag: Tag.GALACTIC, each: 3},
      behavior: {production: {energy: -3}},

      action: {ocean: {}},

      metadata: {
        cardNumber: 'S03',
        renderData: CardRenderer.builder((b) => {
          b.action('Place an ocean tile.', (eb) => {
            eb.empty().startAction.oceans(1);
          }).br;
          b.production((pb) => pb.minus().energy(3));
        }),
        description: 'Decrease your energy production 3 steps. 3 VP for each Galactic tag you have, including this.',
      },
    });
  }
}
