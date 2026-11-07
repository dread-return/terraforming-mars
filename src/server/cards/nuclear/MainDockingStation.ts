import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SpaceName} from '../../../common/boards/SpaceName';

export class MainDockingStation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MAIN_DOCKING_STATION,
      tags: [Tag.CITY, Tag.SPACE, Tag.BUILDING],
      cost: 20,
      behavior: {city: {space: SpaceName.MAIN_DOCKING_STATION}},

      metadata: {
        cardNumber: 'N50',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1).slash().city().asterix()).nbsp.city().asterix();
        }),
        description: 'Increase your M€ production 1 step for every city you own on Mars, plus 1 for this one. Place a city tile ON THE RESERVED AREA outside Mars.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const count = player.game.board.getCitiesOnMars(player).length + 1;
    player.production.add(Resource.MEGACREDITS, count, {log: true});
    return undefined;
  }
}
