import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {digit} from '../Options';
import {InfrastructureActionCard} from './InfrastructureCard';
import {OreConversion, offerOreConversion} from './OreConversion';

const CONVERSIONS: ReadonlyArray<OreConversion> = [
  {title: 'Convert 2 ore into 1 titanium', apply: (player) => player.stock.add(Resource.TITANIUM, 1, {log: true})},
  {title: 'Convert 2 ore into 2 steel', apply: (player) => player.stock.add(Resource.STEEL, 2, {log: true})},
];

/** The printed text says 1 ore = 1 titanium or 2 steel; the icons (followed here) say 2 ore. */
export class AutoFactory extends InfrastructureActionCard {
  constructor(copy: number = 1) {
    super(CardName.AUTO_FACTORY, copy, {
      resourceType: CardResource.ORE,
      action: {
        addResources: 1,
      },
      metadata: {
        cardNumber: 'HO15',
        renderData: CardRenderer.builder((b) => {
          b.action('Add 1 ore to this card.', (eb) => eb.empty().startAction.resource(CardResource.ORE)).br;
          b.effect('2 ore here can be converted at any time into 1 titanium or 2 steel.', (eb) => {
            eb.resource(CardResource.ORE, {amount: 2, digit}).startEffect.titanium(1).slash().steel(2, {digit});
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
