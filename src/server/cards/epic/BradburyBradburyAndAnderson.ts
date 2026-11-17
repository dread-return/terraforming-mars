import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {isSpecialTileSpace} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class BradburyBradburyAndAnderson extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BRADBURY_BRADBURY_AND_ANDERSON,
      tags: [Tag.MARS],
      startingMegaCredits: 45,

      metadata: {
        cardNumber: 'EP-BBA',
        description: 'You start with 45 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any owned tile other than a city or greenery is placed, gain 5 M€.', (eb) => {
              eb.specialTile({all}).startEffect.megacredits(5);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (space.player !== undefined && isSpecialTileSpace(space)) {
      cardOwner.stock.add(Resource.MEGACREDITS, 5, {log: true, from: {card: this}});
    }
  }
}
