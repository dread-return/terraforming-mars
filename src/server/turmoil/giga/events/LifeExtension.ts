import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, citiesOf, tagsOf, gain, lose} from './GigaEventHelpers';

export class LifeExtension extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.LIFE_EXTENSION,
      description: 'Gain 2 M€ per city you own and influence. Lose 1 M€ per city tag you have.',
      revealedDelegate: PartyName.TRANSHUMANISTS,
      currentDelegate: PartyName.CENTRISTS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(2).slash().city().influence({size: Size.SMALL}).nbsp.megacredits(-1).slash().tag(Tag.CITY);
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.MEGACREDITS, 2 * (citiesOf(player) + influenceOf(player)), this);
    lose(player, Resource.MEGACREDITS, tagsOf(player, Tag.CITY), this);
  }
}
