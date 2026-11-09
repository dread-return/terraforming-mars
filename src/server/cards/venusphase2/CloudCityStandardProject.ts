import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {TileType} from '../../../common/TileType';
import {Resource} from '../../../common/Resource';
import {VenusStandardProject} from './VenusStandardProject';

export class CloudCityStandardProject extends VenusStandardProject {
  constructor() {
    super({
      name: CardName.CLOUD_CITY_STANDARD_PROJECT,
      cost: 25,
      metadata: {
        cardNumber: 'SP',
        renderData: CardRenderer.builder((b) =>
          b.standardProject('Spend 25 M€ to place a Venus Habitat, raise Venus 1 step and your M€ production 1 step. Floaters from your cards pay 3 M€ each.', (eb) => {
            eb.megacredits(25).asterix().startAction.tile(TileType.VENUS_HABITAT).production((pb) => pb.megacredits(1));
          }),
        ),
      },
    }, TileType.VENUS_HABITAT);
  }

  public actionEssence(player: IPlayer): void {
    this.placeTile(player);
    player.production.add(Resource.MEGACREDITS, 1, {log: true});
  }
}
