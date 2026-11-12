import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {CardResource} from '../../../../common/CardResource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, gain} from './GigaEventHelpers';

export class AtmosphericPorts extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.ATMOSPHERIC_PORTS,
      description: 'Gain 2 M€ per active card with floaters on it and influence.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(2).slash().resource(CardResource.FLOATER).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const cards = player.getCardsWithResources(CardResource.FLOATER).length;
    gain(player, Resource.MEGACREDITS, 2 * (cards + influenceOf(player)), this);
  }
}
