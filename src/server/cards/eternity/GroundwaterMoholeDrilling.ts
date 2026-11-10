import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {Tag} from '../../../common/cards/Tag';

export class GroundwaterMoholeDrilling extends PreludeCard {
  constructor() {
    super({
      name: CardName.GROUNDWATER_MOHOLE_DRILLING,
      tags: [Tag.BUILDING],
      behavior: {
        production: {steel: 1},
        stock: {heat: 3},
      },
      metadata: {
        cardNumber: 'EP22',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).asterix().production((pb) => pb.steel(1)).heat(3);
        }),
        description: 'Place an ocean tile on Mars where you gain steel as a placement bonus, ignoring normal placement restrictions. Increase your steel production 1 step. Gain 3 heat.',
      },
    });
  }

  private spaces(player: IPlayer) {
    return player.game.board.spaces.filter((s) => s.tile === undefined && s.player === undefined && s.bonus.includes(SpaceBonus.STEEL) && (s.spaceType === 'land' || s.spaceType === 'ocean'));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select a space with a steel bonus for the ocean', this.spaces(player)).andThen((space) => {
      player.game.addOcean(player, space);
      return undefined;
    }));
    return undefined;
  }
}
