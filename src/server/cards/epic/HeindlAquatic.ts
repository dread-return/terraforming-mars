import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {all} from '../Options';

export class HeindlAquatic extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HEINDL_AQUATIC,
      tags: [Tag.PLANT],
      startingMegaCredits: 40,

      behavior: {
        stock: {plants: 3},
      },

      metadata: {
        cardNumber: 'EP-HAQ',
        description: 'You start with 40 M€ and 3 plants.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).plants(3);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('You may use microbes as plants.', (eb) => {
              eb.resource(CardResource.MICROBE).startEffect.plants(1);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('An ocean placed next to your greenery: +1 plant production.', (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).greenery({size: Size.SMALL}).startEffect.production((pb) => pb.plants(1));
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (!Board.isUncoveredOceanSpace(space)) {
      return;
    }
    const greeneries = cardOwner.game.board.getAdjacentSpaces(space).filter((s) => Board.isGreenerySpace(s) && s.player === cardOwner);
    if (greeneries.length > 0) {
      cardOwner.production.add(Resource.PLANTS, 1, {log: true, from: {card: this}});
    }
  }
  // Microbes as plants: free conversion in EpicHooks.freeActionOption.
}
