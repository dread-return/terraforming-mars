import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {IGame} from '../../../IGame';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, tagsOf, gain} from './GigaEventHelpers';

export class VenusVolcanism extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.VENUS_VOLCANISM,
      description: 'Raise Venus 2 steps. Gain 2 heat per Venus tag (max 5) and influence.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.EMPOWER,
      renderData: CardRenderer.builder((b) => {
        b.venus(2).nbsp.heat(2).slash().tag(Tag.VENUS).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    game.increaseVenusScaleLevel(game.playersInGenerationOrder[0], 2);
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.HEAT, 2 * (Math.min(5, tagsOf(player, Tag.VENUS)) + influenceOf(player)), this);
  }
}
