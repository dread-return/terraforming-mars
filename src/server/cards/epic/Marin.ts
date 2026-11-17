import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class Marin extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MARIN,
      tags: [Tag.PLANT],
      startingMegaCredits: 47,

      metadata: {
        cardNumber: 'EP-MRN',
        description: 'You start with 47 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(47).br;
          b.effect('Whenever an ocean tile is placed, collect 1 M€ and 2 plants.', (eb) => {
            eb.oceans(1, {all}).startEffect.megacredits(1).plants(2);
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isUncoveredOceanSpace(space)) {
      cardOwner.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
      cardOwner.stock.add(Resource.PLANTS, 2, {log: true, from: {card: this}});
    }
  }
}
