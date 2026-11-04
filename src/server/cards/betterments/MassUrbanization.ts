import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {BettermentsUtils} from './BettermentsUtils';

export class MassUrbanization extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MASS_URBANIZATION,
      tags: [Tag.MARS, Tag.CITY, Tag.BUILDING],
      cost: 69,
      requirements: {cities: 3},
      victoryPoints: 3,

      metadata: {
        cardNumber: 'B41',
        renderData: CardRenderer.builder((b) => {
          b.city().city().city();
        }),
        description: 'Requires that you own 3 cities on Mars. Place 3 city tiles.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return BettermentsUtils.citiesOnMars(player).length >= 3 &&
      player.game.board.getAvailableSpacesForCity(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.game.defer(new PlaceCityTile(player));
    }
    return undefined;
  }
}
