import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class TheVines extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.THE_VINES,
      tags: [Tag.PLANT],
      startingMegaCredits: 22,
      resourceType: CardResource.ROOT,
      behavior: {
        production: {megacredits: -2, plants: 4},
      },
      action: {
        spend: {resourcesHere: 2},
        production: {plants: 1},
      },
      metadata: {
        cardNumber: 'EC21',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(22).production((pb) => pb.megacredits(-2).plants(4)).br;
          b.corpBox('effect-action', (ce) => {
            ce.action('Remove 2 roots: +1 plant production.', (eb) => eb.resource(CardResource.ROOT, 2).startAction.production((pb) => pb.plants(1)));
            ce.effect('When you place a greenery: +1 M€ production and a root here.', (eb) => eb.greenery({withO2: false}).startEffect.production((pb) => pb.megacredits(1)).resource(CardResource.ROOT));
          });
        }),
        description: 'You start with 22 M\u20ac, -2 M\u20ac production and 4 plant production.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && cardOwner === activePlayer && Board.isGreenerySpace(space)) {
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true});
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
