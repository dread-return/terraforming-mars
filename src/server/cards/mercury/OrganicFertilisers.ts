import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';

export class OrganicFertilisers extends ActCard {
  constructor() {
    super({
      name: CardName.ORGANIC_FERTILISERS,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.PLANT],
      bothBehavior: {production: {plants: 3}},
      metadata: {
        cardNumber: 'ACT24',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(3));
        }),
        description: 'Both players require an animal tag. Resolve (both): increase your plant production 3 steps.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.tags.count(Tag.ANIMAL, 'raw') > 0 && other.tags.count(Tag.ANIMAL, 'raw') > 0;
  }
}
