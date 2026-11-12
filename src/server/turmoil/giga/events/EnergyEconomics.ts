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

export class EnergyEconomics extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.ENERGY_ECONOMICS,
      description: 'Gain 3 energy. Lose 2 M€ per energy tag you have (max 5, then reduced by influence).',
      revealedDelegate: PartyName.EMPOWER,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.energy(3).nbsp.megacredits(-2).slash().tag(Tag.POWER).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.ENERGY, 3, this);
    lose(player, Resource.MEGACREDITS, 2 * Math.max(0, Math.min(5, tagsOf(player, Tag.POWER)) - influenceOf(player)), this);
  }
}
