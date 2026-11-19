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
import {all} from '../Options';

export class Oasis extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.OASIS,
      tags: [Tag.PLANT],
      startingMegaCredits: 45,

      firstAction: {
        text: 'Place a greenery tile',
        greenery: {},
      },

      metadata: {
        cardNumber: 'EP-OAS',
        description: 'You start with 45 M€. First action: place a greenery.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(45).greenery();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.greenery({size: Size.SMALL}).text('alone', {size: Size.SMALL}).startEffect.production((pb) => pb.megacredits(1));
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Greeneries may go next to no tile (+1 M€ production). Opponent tile next to your greenery: +3 M€.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL, all}).greenery({size: Size.SMALL}).startEffect.megacredits(3);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY || space.tile === undefined) {
      return;
    }
    const adjacent = cardOwner.game.board.getAdjacentSpaces(space);
    if (cardOwner === activePlayer) {
      if (Board.isGreenerySpace(space) && !adjacent.some((s) => Board.hasRealTile(s))) {
        cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
      }
      return;
    }
    if (adjacent.some((s) => Board.isGreenerySpace(s) && s.player === cardOwner)) {
      cardOwner.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {card: this}});
    }
  }
}
