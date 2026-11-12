import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {GainResources} from '../../../inputs/GainResources';
import {message} from '../../../logs/MessageBuilder';
import {cardsWithoutTags} from '../GigaHelpers';
import {influenceOf} from './GigaEventHelpers';

export class LonelinessInACrowd extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.LONELINESS_IN_A_CROWD,
      description: 'Gain 1 standard resource of your choice per played card without tags and influence.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.TRANSHUMANISTS,
      renderData: CardRenderer.builder((b) => {
        b.wild(1).slash().noTags().influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const count = cardsWithoutTags(player) + influenceOf(player);
    if (count > 0) {
      player.defer(new GainResources(player, count, message('Loneliness in a Crowd Global Event - Gain ${0} resource(s)', (b) => b.number(count))));
    }
  }
}
