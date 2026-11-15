import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {digit} from '../Options';
import {InfrastructureActionCard} from './InfrastructureCard';
import {OreConversion, offerOreConversion} from './OreConversion';

const CONVERSIONS: ReadonlyArray<OreConversion> = [{
  title: 'Convert 2 ore into 1 energy and 1 heat',
  apply: (player) => {
    player.stock.add(Resource.ENERGY, 1, {log: true});
    player.stock.add(Resource.HEAT, 1, {log: true});
  },
}];

/** Epic version: add 2 ore to any card; 2 ore here convert into 1 energy and 1 heat at any time. */
export class AsteroidMine extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.ASTEROID_MINE, copy, {
      resourceType: CardResource.ORE,
      action: {
        addResourcesToAnyCard: {type: CardResource.ORE, count: 2},
      },
      metadata: {
        cardNumber: 'HO18',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 2 ore to any card.', (eb) => eb.empty().startAction.resource(CardResource.ORE, {amount: 2, digit}).asterix()).br;
          b.effect('2 ore here can be converted at any time into 1 energy and 1 heat.', (eb) => {
            eb.resource(CardResource.ORE, {amount: 2, digit}).startEffect.energy(1).heat(1);
          });
        }),
      },
    });
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard): void {
    if (playedCard === this) {
      offerOreConversion(player, this, CONVERSIONS);
    }
  }
}
