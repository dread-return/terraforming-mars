import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {VenusStandardProject} from './VenusStandardProject';

export class FloatingArrayStandardProject extends VenusStandardProject {
  constructor() {
    super({
      name: CardName.FLOATING_ARRAY_STANDARD_PROJECT,
      cost: 19,
      metadata: {
        cardNumber: 'SP',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 19 M€ to place a Floating Array on Venus and raise Venus 1 step. Floaters from your cards pay 3 M€ each.', (eb) => {
            eb.megacredits(19).asterix().startAction.tile(TileType.VENUS_FLOATING_ARRAY).venus(1);
          }),
        ),
      },
    }, TileType.VENUS_FLOATING_ARRAY);
  }

  public actionEssence(player: IPlayer): void {
    this.placeTile(player);
  }
}
