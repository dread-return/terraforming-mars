import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Space} from '../../boards/Space';

export class AquaticLifeLaboratory extends PostludeCard {
  constructor() {
    super({
      name: CardName.AQUATIC_LIFE_LABORATORY,
      type: CardType.AUTOMATED,
      cost: 11,
      tags: [Tag.SCIENCE],
      postludeKind: 'ocean',
      victoryPoints: {tag: Tag.SCIENCE, per: 4},

      metadata: {
        cardNumber: 'L28',
        renderData: CardRenderer.builder((b) => {
          b.effect('Add 2 science resources to any card. Adjacency bonus: 1 science resource.', (eb) => eb.empty().startEffect.resource(CardResource.SCIENCE, 2));
        }),
        description: 'Place the Aquatic Life Laboratory tile on top of an ocean. Add 2 science resources to any card. Adjacency bonus: 1 science resource. 1 VP for every 4 science tags you own.',
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    Postludes.addResourceToAnyCard(player, CardResource.SCIENCE, 2);
  }
}
