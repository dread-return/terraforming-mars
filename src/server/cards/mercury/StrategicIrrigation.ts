import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectSpace} from '../../inputs/SelectSpace';
import {TileType} from '../../../common/TileType';
import {Board} from '../../boards/Board';
import {ActHelpers} from '../../mercury/ActHelpers';

export class StrategicIrrigation extends ActCard {
  constructor() {
    super({
      name: CardName.STRATEGIC_IRRIGATION,
      kind: 'rivalry',
      steps: 4,
      tags: [],
      metadata: {
        cardNumber: 'ACT42',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).minus().oceans(1).oceans(1).asterix().br.text('defeat:', {size: Size.SMALL}).minus().megacredits(2).slash().greenery().asterix();
        }),
        description: 'Requires an ocean tile on Mars. Victory: remove any ocean tile from Mars and place an ocean tile on Mars. Defeat: pay 2 M€ for every greenery tile you have next to an ocean tile.',
      },
    });
  }

  public override canDevelop(initiator: IPlayer, _other: IPlayer) {
    return initiator.game.board.getOceanSpaces().length > 0;
  }

  public override victory(victor: IPlayer) {
    const game = victor.game;
    victor.defer(() => {
      const oceans = game.board.getOceanSpaces({upgradedOceans: false});
      if (oceans.length === 0) {
        return undefined;
      }
      return new SelectSpace('Strategic Irrigation: select an ocean tile to remove', oceans).andThen((space) => {
        game.removeTile(space.id);
        game.log('${0} removed an ocean tile', (b) => b.player(victor));
        victor.defer(() => new SelectSpace('Strategic Irrigation: select where to place the ocean tile', game.board.getAvailableSpacesForOcean(victor)).andThen((target) => {
          game.addTile(victor, target, {tileType: TileType.OCEAN});
          return undefined;
        }));
        return undefined;
      });
    });
  }

  public override defeat(defeated: IPlayer) {
    const board = defeated.game.board;
    const greeneries = board.getGreeneries(defeated).filter((g) => board.getAdjacentSpaces(g).some(Board.isOceanSpace));
    ActHelpers.payUpTo(defeated, 2 * greeneries.length);
  }
}
