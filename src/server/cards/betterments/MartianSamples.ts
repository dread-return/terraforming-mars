import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {SelectSpace} from '../../inputs/SelectSpace';
import {LogHelper} from '../../LogHelper';

export class MartianSamples extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARTIAN_SAMPLES,
      tags: [Tag.MARS],
      cost: 6,
      requirements: {oxygen: 4, max: true},

      metadata: {
        cardNumber: 'B46',
        renderData: CardRenderer.builder((b) => {
          b.emptyTile().emptyTile().emptyTile().asterix().colon().wild(1);
        }),
        description: 'Requires 4% oxygen or less. Reserve 3 non-reserved land areas: only you may place tiles there. ' +
          'When you place a tile on one of them, gain 1 standard resource of your choice.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getNonReservedLandSpaces().length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.defer(() => {
        const spaces = player.game.board.getNonReservedLandSpaces();
        if (spaces.length === 0) {
          return undefined;
        }
        return new SelectSpace('Select an area to reserve with Martian Samples', spaces)
          .andThen((space) => {
            space.player = player;
            if (!space.bonus.includes(SpaceBonus.STANDARD_RESOURCE)) {
              space.bonus.push(SpaceBonus.STANDARD_RESOURCE);
            }
            LogHelper.logBoardTileAction(player, space, 'Martian Samples claim');
            return undefined;
          });
      });
    }
    return undefined;
  }
}
