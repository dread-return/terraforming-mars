import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';

export class EvergreenEnergy extends CorporationCard {
  constructor() {
    super({
      name: CardName.EVERGREEN_ENERGY,
      tags: [Tag.PLANT, Tag.POWER],
      startingMegaCredits: 32,

      behavior: {
        production: {energy: 1, plants: 1},
      },

      metadata: {
        cardNumber: 'EP-EVG',
        description: 'You start with 32 M€, 1 energy production and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).production((pb) => pb.energy(1).plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.greenery({size: Size.SMALL}).startEffect.production((pb) => pb.energy(1));
            });
            ce.vSpace(Size.TINY);
            ce.effect('Your greenery: +1 energy production. Use plants as energy (not energy as plants).', (eb) => {
              eb.text('X').plants(1).startEffect.text('X').energy(1);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner === activePlayer && Board.isGreenerySpace(space)) {
      cardOwner.production.add(Resource.ENERGY, 1, {log: true});
    }
  }
}
