import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {PlayerInput} from '../../PlayerInput';

/** A card has a global-parameter requirement (oxygen, temperature, oceans, Venus or a Moon rate). */
export function hasGlobalRequirement(card: IProjectCard): boolean {
  return card.requirements.some((r) =>
    r.oxygen !== undefined || r.temperature !== undefined || r.oceans !== undefined || r.venus !== undefined ||
    r.habitatRate !== undefined || r.miningRate !== undefined || r.logisticRate !== undefined);
}

/**
 * The Epic "wild resource" corporations: Discount Conglomerate, Flexi-Change Industry, Jump-Start Corporation,
 * Short-Cut Enterprise, Standard Business, Streamline Logistics, Terra-Invest Firm and Top-Up Operation.
 *
 * They collect wild resources on the corporation card. A wild resource can be used as any standard resource
 * at any time (a free conversion in the action menu, see EpicHooks.freeActionOption), or spent on the corp's action.
 * Most of them also start with extra M€ for each other player.
 */
export abstract class WildResourceCorporation extends ActiveCorporationCard implements ICorporationCard {
  /** M€ gained at the start for each other player. */
  protected perOpponent(): number {
    return 0;
  }

  public override bespokePlay(player: IPlayer): PlayerInput | undefined {
    const bonus = this.perOpponent() * (player.game.players.length - 1);
    if (bonus > 0) {
      player.stock.add(Resource.MEGACREDITS, bonus, {log: true, from: {card: this}});
    }
    return undefined;
  }

  protected addWild(player: IPlayer, count: number = 1): void {
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }
}
