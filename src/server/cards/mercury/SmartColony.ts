import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectColony} from '../../inputs/SelectColony';
import {MAX_COLONIES_PER_TILE} from '../../../common/constants';

export class SmartColony extends ActCard {
  constructor() {
    super({
      name: CardName.SMART_COLONY,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.SPACE],
      metadata: {
        cardNumber: 'ACT15',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1).colonies(1).asterix().minus().megacredits(4);
        }),
        description: 'Resolve: choose a colony tile with at least 2 free spaces. Both of you place a colony on it and pay 4 M€.',
      },
    });
  }

  public override resolveTreaty(owner: IPlayer, other: IPlayer | undefined) {
    const players = [owner, ...(other === undefined ? [] : [other])];
    const tiles = owner.game.colonies.filter((c) => c.isActive && MAX_COLONIES_PER_TILE - c.colonies.length >= players.length);
    if (tiles.length === 0) {
      owner.game.log('There is no colony tile with 2 free spaces');
      return;
    }
    owner.defer(new SelectColony('Smart Colony: choose a colony tile with 2 free spaces', 'Choose', tiles).andThen((colony) => {
      for (const p of players) {
        if (p.megaCredits >= 4) {
          p.stock.deduct(Resource.MEGACREDITS, 4, {log: true});
          colony.addColony(p);
        }
      }
      return undefined;
    }));
  }
}
