import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Board, isSpecialTileSpace} from '../../boards/Board';

export class RedShip extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.RED_SHIP,
      tags: [],
      startingMegaCredits: 48,
      action: {},

      metadata: {
        cardNumber: 'EP-RSH',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(48);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Gain 2 M€ per city or special tile adjacent to at least one ocean.', (eb) => {
              eb.empty().startAction.megacredits(2).slash().cityorSpecialTile({all}).oceans(1, {size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  public static count(player: IPlayer): number {
    const board = player.game.board;
    return board.spaces
      .filter((space) => Board.isCitySpace(space) || isSpecialTileSpace(space))
      .filter((space) => board.getAdjacentSpaces(space).some((s) => Board.isOceanSpace(s)))
      .length;
  }

  public override bespokeCanAct(player: IPlayer) {
    return RedShip.count(player) > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.stock.add(Resource.MEGACREDITS, 2 * RedShip.count(player), {log: true});
    return undefined;
  }
}
