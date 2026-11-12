import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, tagsOf, draw} from './GigaEventHelpers';

export class BlackSwanManifestation extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.BLACK_SWAN_MANIFESTATION,
      description: 'Draw 1 card per 3 science tags you have. Influence counts as science tags.',
      revealedDelegate: PartyName.POPULISTS,
      currentDelegate: PartyName.EMPOWER,
      renderData: CardRenderer.builder((b) => {
        b.cards(1).slash().text('3', {size: Size.SMALL}).tag(Tag.SCIENCE).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    draw(player, Math.floor((tagsOf(player, Tag.SCIENCE) + influenceOf(player)) / 3));
  }
}
