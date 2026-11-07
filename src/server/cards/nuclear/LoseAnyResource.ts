import {IPlayer} from '../../IPlayer';
import {DeferredAction} from '../../deferredActions/DeferredAction';
import {Priority} from '../../deferredActions/Priority';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {message} from '../../logs/MessageBuilder';

const LOSABLE = [Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT] as const;

/** `player` loses 1 standard resource of their choice other than M€ (Aerosol Isotopes). */
export class LoseAnyResource extends DeferredAction {
  constructor(player: IPlayer, private source: CardName) {
    super(player, Priority.LOSE_RESOURCE_OR_PRODUCTION);
  }

  public execute() {
    const options = LOSABLE
      .filter((resource) => this.player.stock.get(resource) > 0)
      .map((resource) => new SelectOption(message('Lose 1 ${0}', (b) => b.string(resource))).andThen(() => {
        this.player.stock.deduct(resource, 1, {log: true});
        return undefined;
      }));
    if (options.length === 0) {
      return undefined;
    }
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options).setTitle(message('${0}: lose 1 resource of your choice (not M€)', (b) => b.cardName(this.source)));
  }
}
