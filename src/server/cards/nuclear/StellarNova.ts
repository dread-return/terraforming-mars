import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {RemoveOceanTile} from '../../deferredActions/RemoveOceanTile';
import {max} from '../Options';

export class StellarNova extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.STELLAR_NOVA,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 18,
      requirements: {oceans: 7, max},
      behavior: {
        global: {temperature: 1},
        stock: {steel: 1, titanium: 2, energy: 1, heat: 2},
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1},
      },

      metadata: {
        cardNumber: 'N68',
        renderData: CardRenderer.builder((b) => {
          b.minus().oceans(1).nbsp.temperature(1).br;
          b.steel(1).titanium(2).br;
          b.energy(1).heat(2).nbsp.resource(CardResource.RADIATION).asterix();
        }),
        description: 'Requires at most 7 oceans in play. Remove an ocean tile. Raise the temperature 1 step. ' +
          'Gain 1 steel, 2 titanium, 1 energy and 2 heat. Add a radiation to ANY card.',
      },
    });
  }

  // The icon shows "remove an ocean"; the card text leaves it out. Following the icon.
  public override bespokePlay(player: IPlayer) {
    player.game.defer(new RemoveOceanTile(player, 'Stellar Nova: select an ocean tile to remove'));
    return undefined;
  }
}
