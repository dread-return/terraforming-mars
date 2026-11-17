import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';

export class Blizzcorp extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BLIZZCORP,
      tags: [Tag.MARS],
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'EP-BLZ',
        description: 'You start with 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.temperature(1).text('<0', {size: Size.SMALL}).startEffect.megacredits(-1).text('/ +2 at 0+', {size: Size.SMALL});
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Cards cost 1 M€ less below 0°C, 2 M€ more at 0°C+. Greenery standard project in the top or bottom 2 rows: +5 M€.', (eb) => {
              eb.plate('Greenery').asterix().startEffect.megacredits(5);
            });
          });
        }),
      },
    });
  }

  public data: {pending?: boolean} = {};

  public override getCardDiscount(player: IPlayer) {
    return player.game.getTemperature() < 0 ? 1 : -2;
  }

  public onStandardProject(_player: IPlayer, project: IStandardProjectCard) {
    if (project.name === CardName.GREENERY_STANDARD_PROJECT) {
      this.data.pending = true;
    }
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || !Board.isGreenerySpace(space) || this.data.pending !== true) {
      return;
    }
    this.data.pending = false;
    const rows = cardOwner.game.board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY).map((s) => s.y);
    const top = Math.min(...rows);
    const bottom = Math.max(...rows);
    if (space.y <= top + 1 || space.y >= bottom - 1) {
      cardOwner.stock.add(Resource.MEGACREDITS, 5, {log: true, from: {card: this}});
    }
  }
}
