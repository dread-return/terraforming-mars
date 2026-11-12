import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Space} from '../../boards/Space';

export class MarineAquarium extends PostludeCard {
  constructor() {
    super({
      name: CardName.MARINE_AQUARIUM,
      type: CardType.AUTOMATED,
      cost: 12,
      tags: [Tag.ANIMAL],
      postludeKind: 'ocean',
      victoryPoints: {tag: Tag.ANIMAL, per: 3},

      metadata: {
        cardNumber: 'L33',
        renderData: CardRenderer.builder((b) => {
          b.effect('Add an animal to any card for each animal tag you own, including this. Adjacency bonus: 1 animal.', (eb) => eb.empty().startEffect.resource(CardResource.ANIMAL).slash().tag(Tag.ANIMAL));
        }),
        description: 'Place the Marine Aquarium tile on top of an ocean. Add an animal to any card for each animal tag you own, including this. Adjacency bonus: 1 animal. 1 VP for every 3 animal tags you own. (The printed text says energy for the adjacency bonus and 1 VP per animal tag, but the icons show an animal and 1 VP per 3.)',
      },
    });
  }

  protected override onPlaced(player: IPlayer, _space: Space): void {
    const count = this.tagCount(player, Tag.ANIMAL);
    if (count > 0) {
      Postludes.addResourceToAnyCard(player, CardResource.ANIMAL, count);
    }
  }
}
