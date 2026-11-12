import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {tagsOf, gain} from './GigaEventHelpers';

export class MarinersAgreements extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.MARINERS_AGREEMENTS,
      description: 'Gain 2 M€ per city tag you have. Draw and discard 1 postlude card per influence.',
      revealedDelegate: PartyName.CENTRISTS,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(2).slash().tag(Tag.CITY).br;
        b.text('postlude', {size: Size.SMALL}).slash().influence({size: Size.SMALL});
      }),
    });
  }

  // TODO(Leo): postludes do not exist yet. Only the M€ half is played for now.
  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.MEGACREDITS, 2 * tagsOf(player, Tag.CITY), this);
  }
}
