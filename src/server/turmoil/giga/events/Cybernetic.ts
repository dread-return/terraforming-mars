import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, tagsOf} from './GigaEventHelpers';

export class Cybernetic extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.CYBERNETIC,
      description: 'Raise your titanium production 1 step if you have at least 5 science tags. Influence counts as science tags.',
      revealedDelegate: PartyName.TRANSHUMANISTS,
      currentDelegate: PartyName.EMPOWER,
      renderData: CardRenderer.builder((b) => {
        b.text('5', {size: Size.SMALL}).tag(Tag.SCIENCE).influence({size: Size.SMALL}).colon().production((pb) => pb.titanium(1));
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    if (tagsOf(player, Tag.SCIENCE) + influenceOf(player) >= 5) {
      player.production.add(Resource.TITANIUM, 1, {log: true, from: {globalEvent: this}});
    }
  }
}
