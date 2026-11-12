import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {Board} from '../../boards/Board';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';

export class DeluxeWaterfrontResort extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.DELUXE_WATERFRONT_RESORT,
      type: CardType.ACTIVE,
      cost: 7,
      tags: [Tag.EARTH, Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L03',
        renderData: CardRenderer.builder((b) => {
          b.action('Gain 3 M€ for each adjacent ocean tile to the Resort.', (ab) => ab.empty().startAction.megacredits(3).slash().oceans(1, {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Resort tile on top of one of your cities that is adjacent to at least one ocean. Action: gain 3 M\u20ac for each adjacent ocean tile to the Resort.',
      },
    });
  }

  protected override spaceAllowed(player: IPlayer, space: Space): boolean {
    return Postludes.neighbors(player.game, space).some(Board.isOceanSpace);
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentOceans(player).length > 0;
  }

  public action(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 3 * this.adjacentOceans(player).length, {log: true});
    return undefined;
  }
}
