import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';

export class SpartansSecurity extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SPARTANS_SECURITY,
      startingMegaCredits: 40,

      behavior: {
        stock: {steel: 1},
      },

      firstAction: {
        text: 'Place a city tile',
        city: {},
      },

      metadata: {
        cardNumber: 'EP-SPS',
        description: 'You start with 40 M€ and 1 steel. First action: place a city.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).steel(1).city();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL, all}).asterix().startEffect.text('steal', {size: Size.SMALL}).megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Opponent\'s tile next to yours: steal 2 M€ from them. Your tile next to theirs: steal 1 M€ from each. Not oceans.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.text('steal', {size: Size.SMALL}).megacredits(1);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY || Board.isOceanSpace(space)) {
      return;
    }
    const adjacent = cardOwner.game.board.getAdjacentSpaces(space).filter((s) => Board.hasRealTile(s) && !Board.isOceanSpace(s));
    if (activePlayer !== cardOwner) {
      if (adjacent.some((s) => s.player === cardOwner)) {
        activePlayer.stock.steal(Resource.MEGACREDITS, 2, cardOwner);
      }
      return;
    }
    const opponents = new Set<IPlayer>();
    for (const s of adjacent) {
      if (s.player !== undefined && s.player !== cardOwner) {
        opponents.add(s.player);
      }
    }
    for (const opponent of opponents) {
      opponent.stock.steal(Resource.MEGACREDITS, 1, cardOwner);
    }
  }
}
