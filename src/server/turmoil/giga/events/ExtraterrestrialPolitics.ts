import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, planetTagsOf, gain, chooseOne} from './GigaEventHelpers';

export class ExtraterrestrialPolitics extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.EXTRATERRESTRIAL_POLITICS,
      description: 'If you have at least 4 planet tags, gain 2 titanium, 4 steel or 5 M€. Each influence counts as a planet tag.',
      revealedDelegate: PartyName.CENTRISTS,
      currentDelegate: PartyName.EMPOWER,
      renderData: CardRenderer.builder((b) => {
        b.text('4', {size: Size.SMALL}).text('planet tags', {size: Size.SMALL}).influence({size: Size.SMALL}).colon().titanium(2).slash().steel(4).slash().megacredits(5);
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    if (planetTagsOf(player) + influenceOf(player) < 4) {
      return;
    }
    chooseOne(player, 'Extraterrestrial Politics Global Event - select what to gain', [
      {title: 'Gain 2 titanium', apply: () => gain(player, Resource.TITANIUM, 2, this)},
      {title: 'Gain 4 steel', apply: () => gain(player, Resource.STEEL, 4, this)},
      {title: 'Gain 5 M€', apply: () => gain(player, Resource.MEGACREDITS, 5, this)},
    ]);
  }
}
