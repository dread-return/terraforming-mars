import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {all} from '../Options';
import {both, greeneries, oceans} from '../render/DynamicVictoryPoints';
import {sum} from '../../../common/utils/utils';

export class Aria extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ARIA,
      tags: [Tag.CITY],
      startingMegaCredits: 40,
      victoryPoints: 'special',

      firstAction: {
        text: 'Place an ocean tile',
        ocean: {},
      },

      metadata: {
        cardNumber: 'EP-ARI',
        description: 'You start with 40 M€. First action: place an ocean. *Your cities score adjacent oceans INSTEAD of greeneries.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(40).oceans(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any city is placed next to an ocean, you and that player each gain 1 M€ production.', (eb) => {
              eb.city({size: Size.SMALL, all}).oceans(1, {size: Size.SMALL}).startEffect.production((pb) => pb.megacredits(1)).asterix();
            });
          });
        }),
        victoryPoints: both({...oceans(1, 1), asterisk: false}, greeneries(-1, true)),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || !Board.isCitySpace(space)) {
      return;
    }
    if (!cardOwner.game.board.getAdjacentSpaces(space).some((s) => Board.isOceanSpace(s))) {
      return;
    }
    cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    if (activePlayer !== cardOwner) {
      activePlayer.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    // Cities normally score their greeneries; Aria swaps that for oceans.
    const board = player.game.board;
    return sum(board.getCities(player).map((city) => {
      const adjacent = board.getAdjacentSpaces(city);
      return adjacent.filter((s) => Board.isOceanSpace(s)).length - adjacent.filter((s) => Board.isGreenerySpace(s)).length;
    }));
  }
}
