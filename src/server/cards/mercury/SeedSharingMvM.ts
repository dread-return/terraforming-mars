import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Mercury} from '../../mercury/Mercury';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';

export class SeedSharingMvM extends ActCard {
  constructor() {
    super({
      name: CardName.SEED_SHARING_MVM,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.PLANT],
      metadata: {
        cardNumber: 'ACT01',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1)).asterix().plus().production((pb) => pb.plants(1)).asterix();
        }),
        description: 'Both players require a plant tag. Resolve (both): at the next production phase, each of you also produces the other player\'s plant production.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, other: IPlayer) {
    return initiator.tags.count(Tag.PLANT, 'raw') > 0 && other.tags.count(Tag.PLANT, 'raw') > 0;
  }

  public override resolveFor(player: IPlayer, other: IPlayer | undefined) {
    if (other !== undefined) {
      Mercury.sharePlantProduction(player, other);
    }
  }
}
