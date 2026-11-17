import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
          b.br.br;
          b.megacredits(44).production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).asterix().startEffect.megacredits(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Any ocean next to your tiles: gain 2 M€. Your ocean tiles: +1 M€ production.', (eb) => {
              eb.oceans(1, {size: Size.SMALL}).startEffect.production((pb) => pb.megacredits(1));
            });
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
