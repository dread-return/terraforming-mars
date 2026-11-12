import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Tag} from '../../../../common/cards/Tag';
import {CardResource} from '../../../../common/CardResource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {AddResourcesToCard} from '../../../deferredActions/AddResourcesToCard';
import {influenceOf, tagsOf} from './GigaEventHelpers';

export class OldEarthReserve extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.OLD_EARTH_RESERVE,
      description: 'Add 1 animal to a card per animal tag you have and per influence.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.resource(CardResource.ANIMAL).slash().tag(Tag.ANIMAL).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const count = tagsOf(player, Tag.ANIMAL) + influenceOf(player);
    if (count > 0) {
      player.game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count}));
    }
  }
}
