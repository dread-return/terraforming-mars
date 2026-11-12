import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {digit} from '../../../cards/Options';
import {influenceOf, setsOfTrOverFifteen, gain} from './GigaEventHelpers';

export class FinancialCrisis extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.FINANCIAL_CRISIS,
      description: 'Gain 5 M€ and lower your M€ production 1 step per set of 5 TR over 15 (max 5) and per influence.',
      revealedDelegate: PartyName.POPULISTS,
      currentDelegate: PartyName.CENTRISTS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(5).nbsp.production((pb) => pb.minus().megacredits(1)).slash().tr(5, {digit, over: 15}).plus().influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.MEGACREDITS, 5, this);
    // M€ production cannot go below -5.
    const steps = Math.min(setsOfTrOverFifteen(player) + influenceOf(player), player.production.megacredits + 5);
    if (steps > 0) {
      player.production.add(Resource.MEGACREDITS, -steps, {log: true, from: {globalEvent: this}});
    }
  }
}
