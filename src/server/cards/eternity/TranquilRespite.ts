import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectSpace} from '../../inputs/SelectSpace';

export class TranquilRespite extends PreludeCard {
  constructor() {
    super({
      name: CardName.TRANQUIL_RESPITE,
      tags: [],
      metadata: {
        cardNumber: 'EP62',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).greenery().asterix().plants(2);
        }),
        description: 'Place an ocean tile next to an open space where a greenery can be played, then place a greenery adjacent to that ocean. Gain 2 plants.',
      },
    });
  }

  private oceanSpaces(player: IPlayer) {
    const board = player.game.board;
    const land = new Set(board.getAvailableSpacesOnLand(player));
    return board.getAvailableSpacesForOcean(player).filter((s) => board.getAdjacentSpaces(s).some((a) => land.has(a)));
  }
  public override bespokeCanPlay(player: IPlayer) {
    return this.oceanSpaces(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    player.stock.add(Resource.PLANTS, 2, {log: true});
    player.defer(new SelectSpace('Select space for ocean', this.oceanSpaces(player)).andThen((ocean) => {
      game.addOcean(player, ocean);
      const land = new Set(game.board.getAvailableSpacesOnLand(player));
      const spaces = game.board.getAdjacentSpaces(ocean).filter((a) => land.has(a));
      if (spaces.length === 0) {
        return undefined;
      }
      return new SelectSpace('Select space for greenery next to that ocean', spaces).andThen((g) => {
        game.addGreenery(player, g);
        return undefined;
      });
    }));
    return undefined;
  }
}
