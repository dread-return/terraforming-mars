import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';

export class FailedKudzuExperiment extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.FAILED_KUDZU_EXPERIMENT,
      tags: [Tag.PLANT, Tag.SCIENCE],
      cost: 26,
      requirements: {tag: Tag.PLANT, count: 5},
      behavior: {
        production: {megacredits: -5, plants: 3},
        stock: {plants: 1},
      },
      metadata: {
        cardNumber: 'E68',
        renderData: CardRenderer.builder((b) => {
          b.greenery().asterix().br.production((pb) => pb.minus().megacredits(5).plus().plants(3)).plants(1);
        }),
        description: 'Requires 5 plant tags. Place a greenery next to no cities or greeneries. Decrease your M\u20ac production 5 steps, increase your plant production 3 steps and gain 1 plant.',
      },
    });
  }

  private spaces(player: IPlayer) {
    const board = player.game.board;
    return board.getAvailableSpacesOnLand(player).filter((s) => board.getAdjacentSpaces(s).every((a) => !Board.isCitySpace(a) && !Board.isGreenerySpace(a)));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.spaces(player).length > 0 && player.production.megacredits >= 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select space for greenery next to no city or greenery', this.spaces(player)).andThen((space) => {
      player.game.addGreenery(player, space);
      return undefined;
    }));
    return undefined;
  }
}
