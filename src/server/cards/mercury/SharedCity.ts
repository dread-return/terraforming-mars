import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {IPlayer} from '../../IPlayer';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {Tag} from '../../../common/cards/Tag';

export class SharedCity extends ActCard {
  constructor() {
    super({
      name: CardName.SHARED_CITY,
      kind: 'treaty',
      steps: 7,
      tags: [Tag.BUILDING, Tag.CITY],
      metadata: {
        cardNumber: 'ACT02',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix();
        }),
        description: 'Resolve: place a city tile on Mars. (Held out of the deck: in the original, the city is owned by both players and only scores for the other players\' greeneries.)',
      },
    });
  }

  public override resolveTreaty(owner: IPlayer) {
    owner.game.defer(new PlaceCityTile(owner));
  }
}
