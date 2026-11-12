import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, tagsOf, gain, lose} from './GigaEventHelpers';

export class EffectsOfRadiation extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.EFFECTS_OF_RADIATION,
      description: 'Lose 4 energy, reduced by influence. Gain 2 M€ per energy tag you have.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.TRANSHUMANISTS,
      renderData: CardRenderer.builder((b) => {
        b.energy(-4).influence({size: Size.SMALL}).nbsp.megacredits(2).slash().tag(Tag.POWER);
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    lose(player, Resource.ENERGY, Math.max(0, 4 - influenceOf(player)), this);
    gain(player, Resource.MEGACREDITS, 2 * tagsOf(player, Tag.POWER), this);
  }
}
