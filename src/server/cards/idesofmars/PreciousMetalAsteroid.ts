import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {LogHelper} from '../../LogHelper';
import {IdesOfMars} from './IdesOfMars';
import {all, digit} from '../Options';

export class PreciousMetalAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.PRECIOUS_METAL_ASTEROID,
      tags: [Tag.SPACE],
      cost: 16,

      behavior: {
        global: {temperature: 1},
        stock: {megacredits: 5},
        removeAnyPlants: 3,
      },

      metadata: {
        cardNumber: 'I02',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).megacredits(5).br;
          b.text('3').emptyTile().colon().megacredits(5).asterix().nbsp.minus().plants(3, {all, digit});
        }),
        description: 'Raise the temperature 1 step and gain 5 M€. Mark 3 empty, non-reserved land areas: ' +
          'any player who places a tile on one gains 5 M€. Remove up to 3 plants from any player.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 3; i++) {
      player.defer(() => {
        const spaces = IdesOfMars.emptyUnreservedLand(player);
        if (spaces.length === 0) {
          return undefined;
        }
        return new SelectSpace('Select an area to mark with a 5 M€ silver cube', spaces)
          .andThen((space) => {
            space.bonus.push(SpaceBonus.INCENTIVE_5MC);
            LogHelper.logBoardTileAction(player, space, 'Precious Metal Asteroid marker');
            return undefined;
          });
      });
    }
    return undefined;
  }
}
