import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {SelectSpace} from '../../inputs/SelectSpace';
import {LogHelper} from '../../LogHelper';

export class CompanyIncentives extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.COMPANY_INCENTIVES,
      cost: 4,

      metadata: {
        cardNumber: 'B34',
        renderData: CardRenderer.builder((b) => {
          b.emptyTile().emptyTile().emptyTile().colon().megacredits(5).asterix();
        }),
        description: 'Mark 3 empty areas on Mars. Any player who places a tile on one of them gains an extra 5 M€.',
      },
    });
  }

  public static eligibleSpaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.spaces.filter((space) =>
      (space.spaceType === SpaceType.LAND || space.spaceType === SpaceType.OCEAN) &&
      space.tile === undefined &&
      space.player === undefined &&
      !space.bonus.includes(SpaceBonus.INCENTIVE_5MC));
  }

  public override bespokeCanPlay(player: IPlayer) {
    return CompanyIncentives.eligibleSpaces(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.defer(() => {
        const spaces = CompanyIncentives.eligibleSpaces(player);
        if (spaces.length === 0) {
          return undefined;
        }
        return new SelectSpace('Select an area to mark with Company Incentives', spaces)
          .andThen((space) => {
            space.bonus.push(SpaceBonus.INCENTIVE_5MC);
            LogHelper.logBoardTileAction(player, space, 'Company Incentives marker');
            return undefined;
          });
      });
    }
    return undefined;
  }
}
