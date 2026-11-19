import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';

export class Sirenia extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SIRENIA,
      tags: [Tag.POWER],
      startingMegaCredits: 50,

      metadata: {
        cardNumber: 'EP-SIR',
        description: 'You start with 50 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(50);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you place a city tile, increase your energy production 1 step for each ocean next to it.', (eb) => {
              eb.city({size: Size.SMALL}).startEffect.production((pb) => pb.energy(1)).slash().oceans(1, {size: Size.SMALL}).asterix();
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner.id !== activePlayer.id || !Board.isCitySpace(space) || space.player?.id !== cardOwner.id) {
      return;
    }
    const oceans = cardOwner.game.board.getAdjacentSpaces(space).filter((s) => Board.isOceanSpace(s)).length;
    if (oceans > 0) {
      cardOwner.production.add(Resource.ENERGY, oceans, {log: true, from: {card: this}});
    }
  }
}
