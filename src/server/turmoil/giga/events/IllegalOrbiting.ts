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
import {influenceOf, tagsOf, lose, highestScorers} from './GigaEventHelpers';

export class IllegalOrbiting extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.ILLEGAL_ORBITING,
      description: 'Lose 1 M€ per Earth tag (max 5), reduced by influence. The player(s) with the most space tags raise their titanium production 1 step.',
      revealedDelegate: PartyName.BUREAUCRATS,
      currentDelegate: PartyName.CENTRISTS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(-1).slash().tag(Tag.EARTH).influence({size: Size.SMALL}).nbsp.tag(Tag.SPACE).colon().production((pb) => pb.titanium(1));
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    for (const player of highestScorers(game.playersInGenerationOrder, (p) => tagsOf(p, Tag.SPACE))) {
      player.production.add(Resource.TITANIUM, 1, {log: true, from: {globalEvent: this}});
    }
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    lose(player, Resource.MEGACREDITS, Math.max(0, Math.min(5, tagsOf(player, Tag.EARTH)) - influenceOf(player)), this);
  }
}
