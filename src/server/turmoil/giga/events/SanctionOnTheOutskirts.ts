import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Tag} from '../../../../common/cards/Tag';
import {IPlayer} from '../../../IPlayer';
import {IGame} from '../../../IGame';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, tagsOf, loseOre} from './GigaEventHelpers';

export class SanctionOnTheOutskirts extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.SANCTION_ON_THE_OUTSKIRTS,
      description: 'Lose 1 ore (steel or titanium) per Jovian tag (max 5, then reduced by influence). Move the marker on every colony track 1 space up.',
      revealedDelegate: PartyName.CENTRISTS,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.steel(-1).slash().tag(Tag.JOVIAN).influence({size: Size.SMALL}).nbsp.text('Colony tracks +1', {size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    for (const colony of game.colonies) {
      colony.increaseTrack();
    }
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    loseOre(player, Math.max(0, Math.min(5, tagsOf(player, Tag.JOVIAN)) - influenceOf(player)), this);
  }
}
