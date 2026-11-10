import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class MarsConservationists extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MARS_CONSERVATIONISTS,
      tags: [Tag.PLANT],
      startingMegaCredits: 19,
      behavior: {
        production: {plants: 2},
      },
      firstAction: {
        text: 'Place a greenery tile and raise the oxygen 1 step',
        greenery: {},
      },
      metadata: {
        cardNumber: 'EC03',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(19).production((pb) => pb.plants(2)).greenery().asterix().br;
          b.corpBox('effect', (ce) => {
            ce.effect('City cards and the City standard project cost everyone 3 M€ more.', (eb) => eb.city().startEffect.plus().megacredits(3));
            ce.effect('When ANY player places a greenery, gain a plant and 5 M€.', (eb) => eb.greenery({any: true, withO2: false}).startEffect.plants(1).megacredits(5));
          });
        }),
        description: 'You start with 19 M\u20ac and 2 plant production. First action: place a greenery.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && Board.isGreenerySpace(space)) {
      cardOwner.stock.add(Resource.PLANTS, 1, {log: true});
      cardOwner.stock.add(Resource.MEGACREDITS, 5, {log: true});
    }
  }
}
