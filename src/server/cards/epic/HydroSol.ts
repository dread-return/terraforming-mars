import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class HydroSol extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HYDROSOL,
      tags: [],
      startingMegaCredits: 44,
      behavior: {
        production: {megacredits: 2},
      },

      metadata: {
        cardNumber: 'EP-HYS',
        description: 'You start with 44 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44).production((pb) => pb.megacredits(2)).br;
          b.effect('When any ocean tile is placed next to one of your tiles, gain 2 M€. When you place an ocean tile, increase your M€ production 1 step.', (eb) => {
            eb.oceans(1, {all}).emptyTile().asterix().colon().megacredits(2).nbsp.oceans(1).startEffect.production((pb) => pb.megacredits(1));
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (!Board.isUncoveredOceanSpace(space)) {
      return;
    }
    const board = cardOwner.game.board;
    if (board.getAdjacentSpaces(space).some(Board.ownedBy(cardOwner))) {
      cardOwner.stock.add(Resource.MEGACREDITS, 2, {log: true, from: {card: this}});
    }
    if (cardOwner.id === activePlayer.id) {
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
  }
}
