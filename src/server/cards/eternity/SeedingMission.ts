import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';

export class SeedingMission extends PreludeCard {
  constructor() {
    super({
      name: CardName.SEEDING_MISSION,
      tags: [Tag.PLANT],
      behavior: {
        tr: 1,
        production: {plants: 1},
        stock: {plants: 1},
        drawCard: {count: 1, tag: Tag.PLANT},
      },
      metadata: {
        cardNumber: 'EP49',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).production((pb) => pb.plants(1)).plants(1).cards(1, {secondaryTag: Tag.PLANT});
        }),
        description: 'Raise your TR 1 step. Increase your plant production 1 step. Gain 1 plant. Reveal cards until you reveal a plant card; take it and shuffle the rest back.',
      },
    });
  }
}
