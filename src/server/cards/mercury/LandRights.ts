import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ActHelpers} from '../../mercury/ActHelpers';

export class LandRights extends ActCard {
  constructor() {
    super({
      name: CardName.LAND_RIGHTS,
      kind: 'treaty',
      steps: 7,
      tags: [],
      bothBehavior: {stock: {megacredits: 6}},
      metadata: {
        cardNumber: 'ACT19',
        renderData: CardRenderer.builder((b) => {
          b.text('reserve 3', {size: Size.SMALL}).emptyTile().asterix().megacredits(6);
        }),
        description: 'Resolve (both): reserve 3 non-reserved connected areas on Mars, starting from your tiles (in player order). Gain 6 M€.',
      },
    });
  }

  public override resolveFor(player: IPlayer, other: IPlayer | undefined) {
    super.resolveFor(player, other);
    ActHelpers.reserveConnected(player, 3, {fromOwnTiles: true, gainBonuses: false});
  }
}
