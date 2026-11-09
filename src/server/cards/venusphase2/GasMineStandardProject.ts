import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {Resource} from '../../../common/Resource';
import {VenusStandardProject} from './VenusStandardProject';

export class GasMineStandardProject extends VenusStandardProject {
  constructor() {
    super({
      name: CardName.GAS_MINE_STANDARD_PROJECT,
      cost: 21,
      metadata: {
        cardNumber: 'SP',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 21 M€ to place a Gas Mine on a yellow area, raise Venus 1 step and your heat production 1 step. Floaters from your cards pay 3 M€ each.', (eb) => {
            eb.megacredits(21).asterix().startAction.tile(TileType.VENUS_GAS_MINE).production((pb) => pb.heat(1));
          }),
        ),
      },
    }, TileType.VENUS_GAS_MINE);
  }

  public actionEssence(player: IPlayer): void {
    this.placeTile(player);
    player.production.add(Resource.HEAT, 1, {log: true});
  }
}
