import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

const PRODUCTIONS = [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT];

export class TEPCO extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TEPCO,
      tags: [Tag.RADIOACTIVE, Tag.POWER],
      startingMegaCredits: 41,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},
      behavior: {
        production: {energy: 2},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-TEP',
        description: 'You start with 2 energy production and 41 M€. 1 VP per 4 radiation on this card.',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.energy(2)).megacredits(41).br;
          b.action('Decrease any of your productions 1 step to add 2 radiation to any card.', (eb) => {
            eb.production((pb) => pb.minus().wild(1)).startAction.resource(CardResource.RADIATION, 2).asterix();
          });
        }),
      },
    });
  }

  private decreasable(player: IPlayer): Array<Resource> {
    return PRODUCTIONS.filter((r) => player.production[r] > (r === Resource.MEGACREDITS ? -5 : 0));
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.decreasable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new OrOptions(...this.decreasable(player).map((resource) =>
      new SelectOption(`Decrease your ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, -1, {log: true});
        player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 2}));
        return undefined;
      })),
    ).setTitle('TEPCO: choose a production to decrease');
  }
}
