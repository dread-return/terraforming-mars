import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, planetTagsOf, lose} from './GigaEventHelpers';

export class AntiGovernmentSentiment extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.ANTI_GOVERNMENT_SENTIMENT,
      description: 'Lose 5 M€ if you have at least 3 planet tags (reduced by influence).',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.text('3', {size: Size.SMALL}).text('planet tags', {size: Size.SMALL}).influence({size: Size.SMALL}).colon().megacredits(-5);
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    if (planetTagsOf(player) - influenceOf(player) >= 3) {
      lose(player, Resource.MEGACREDITS, 5, this);
    }
  }
}
