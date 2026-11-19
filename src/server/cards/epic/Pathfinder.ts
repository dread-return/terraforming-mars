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
import {SpaceType} from '../../../common/boards/SpaceType';

export class Pathfinder extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PATHFINDER,
      tags: [Tag.MARS],
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'EP-PTH',
        description: 'You start with 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you first place a tile (not an ocean) in a row, raise your TR 1 step and gain 1 steel.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).text('new row', {size: Size.SMALL}).startEffect.tr(1).steel(1);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY || Board.isOceanSpace(space)) {
      return;
    }
    const others = cardOwner.game.board.spaces.filter((s) =>
      s !== space && s.y === space.y && s.player === cardOwner && Board.hasRealTile(s) && !Board.isOceanSpace(s));
    if (others.length === 0) {
      cardOwner.increaseTerraformRating(1, {log: true});
      cardOwner.stock.add(Resource.STEEL, 1, {log: true, from: {card: this}});
    }
  }
}
