import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class HHCommerce extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HH_COMMERCE,
      startingMegaCredits: 49,
      action: {},

      metadata: {
        cardNumber: 'EP-HHC',
        description: 'You start with 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(49);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.megacredits(6).startAction.wild(1).asterix();
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend 6 M€ for 1 bundle, or 13 M€ for 2. *Bundles: 4 steel, 3 titanium, 3 plants, 4 energy, 5 heat, or 1 resource on a card.', (eb) => {
              eb.megacredits(13).startAction.wild(2).asterix();
            });
          });
        }),
      },
    });
  }

  private bundles(player: IPlayer): Array<SelectOption> {
    const stock: Array<[Resource, number]> = [[Resource.STEEL, 4], [Resource.TITANIUM, 3], [Resource.PLANTS, 3], [Resource.ENERGY, 4], [Resource.HEAT, 5]];
    const result = stock.map(([resource, qty]) => new SelectOption(`${qty} ${resource}`).andThen(() => {
      player.stock.add(resource, qty, {log: true});
      return undefined;
    }));
    if (player.getResourceCards().length > 0) {
      result.push(new SelectOption('1 resource on one of your cards').andThen(() => {
        player.game.defer(new AddResourcesToCard(player, undefined, {count: 1}));
        return undefined;
      }));
    }
    return result;
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford(6);
  }

  public override bespokeAction(player: IPlayer) {
    const pick = (title: string) => new OrOptions(...this.bundles(player)).setTitle(title);
    const options = [new SelectOption('Spend 6 M€ for one bundle', '6 M€').andThen(() => {
      player.game.defer(new SelectPaymentDeferred(player, 6).andThen(() => player.defer(pick('HH Commerce: choose a bundle'))));
      return undefined;
    })];
    if (player.canAfford(13)) {
      options.push(new SelectOption('Spend 13 M€ for two bundles', '13 M€').andThen(() => {
        player.game.defer(new SelectPaymentDeferred(player, 13).andThen(() => {
          player.defer(pick('HH Commerce: choose the first bundle'));
          player.defer(pick('HH Commerce: choose the second bundle'));
        }));
        return undefined;
      }));
    }
    return options.length === 1 ? options[0].cb(undefined) : new OrOptions(...options);
  }
}
