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
import {RemoveResourcesFromCard} from '../../../deferredActions/RemoveResourcesFromCard';
import {influenceOf, tagsOf} from './GigaEventHelpers';

export class Overpopulation extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.OVERPOPULATION,
      description: 'Draw 1 postlude card. Remove 1 animal from your cards. Add 1 microbe to a card per microbe tag you have and per influence.',
      revealedDelegate: PartyName.POPULISTS,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.text('postlude', {size: Size.SMALL}).br;
        b.resource(CardResource.ANIMAL, -1).nbsp.resource(CardResource.MICROBE).slash().tag(Tag.MICROBE).influence({size: Size.SMALL});
      }),
    });
  }

  // TODO(Leo): postludes do not exist yet, so the postlude card is not drawn for now.
  public override bespokeResolvePlayer(player: IPlayer) {
    const game = player.game;
    game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {source: 'self', blockable: false}));
    const count = tagsOf(player, Tag.MICROBE) + influenceOf(player);
    if (count > 0) {
      game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count}));
    }
  }
}
