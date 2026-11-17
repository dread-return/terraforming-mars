import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {ICard} from '../ICard';
import {PlayerInput} from '../../PlayerInput';

const PRODUCTIONS: ReadonlyArray<Resource> = [
  Resource.MEGACREDITS,
  Resource.STEEL,
  Resource.TITANIUM,
  Resource.PLANTS,
  Resource.ENERGY,
  Resource.HEAT,
];

export class EpicUtils {
  /** Asks the player to raise `count` different productions 1 step each, one at a time. */
  public static gainDifferentProductions(player: IPlayer, count: number, card: ICard, exclude: Array<Resource> = []): void {
    if (count <= 0) {
      return;
    }
    const choices = PRODUCTIONS.filter((r) => !exclude.includes(r));
    player.defer(new OrOptions(
      ...choices.map((resource) => new SelectOption(`Increase your ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true, from: {card}});
        EpicUtils.gainDifferentProductions(player, count - 1, card, [...exclude, resource]);
        return undefined;
      })),
    ).setTitle(`${card.name}: choose a production to increase`));
  }

  /** An OrOptions to raise any one production 1 step. */
  public static gainAnyProduction(player: IPlayer, card: ICard, choices: ReadonlyArray<Resource> = PRODUCTIONS): PlayerInput {
    return new OrOptions(
      ...choices.map((resource) => new SelectOption(`Increase your ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true, from: {card}});
        return undefined;
      })),
    ).setTitle(`${card.name}: choose a production to increase`);
  }
}
