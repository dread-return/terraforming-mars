import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Board} from '../../boards/Board';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';

export class CoolingLiquidEmergency extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.COOLING_LIQUID_EMERGENCY,
      cost: 14,
      behavior: {
        stock: {heat: 1},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 3},
      },

      metadata: {
        cardNumber: 'N20',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).asterix().nbsp.heat(1).br;
          b.resource(CardResource.RADIATION, 3).asterix();
        }),
        description: 'Place an ocean tile and get 1 M€ more from each adjacent ocean. Gain 1 heat and add 3 radiation to ANY card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new PlaceOceanTile(player)).andThen((space) => {
      if (space === undefined) {
        return;
      }
      const adjacentOceans = player.game.board.getAdjacentSpaces(space).filter(Board.isOceanSpace).length;
      if (adjacentOceans > 0) {
        player.stock.add(Resource.MEGACREDITS, adjacentOceans, {log: true});
      }
    });
    return undefined;
  }
}
