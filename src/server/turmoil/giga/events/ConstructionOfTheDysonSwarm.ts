import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {IGame} from '../../../IGame';
import {IPlayer} from '../../../IPlayer';
import {highestScorers, lose, tagsOf} from './GigaEventHelpers';

/** Infrastructures a player has: their infrastructure tags (High Orbit). */
function infrastructuresOf(player: IPlayer): number {
  return tagsOf(player, Tag.INFRASTRUCTURE);
}

export class ConstructionOfTheDysonSwarm extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.CONSTRUCTION_OF_THE_DYSON_SWARM,
      description: 'Lose 2 M€ per infrastructure you have. The player with the most infrastructures raises their TR 2 steps, the second 1 step.',
      revealedDelegate: PartyName.BUREAUCRATS,
      currentDelegate: PartyName.POPULISTS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(-2).slash().tag(Tag.INFRASTRUCTURE).br;
        b.text('1st:', {size: Size.SMALL}).tr(2, {size: Size.TINY}).nbsp.text('2nd:', {size: Size.SMALL}).tr(1, {size: Size.TINY});
      }),
    });
  }

  // Ties share the place: everyone tied for most gets 2 TR, and the next count down gets 1 TR. Nobody with 0 places.
  public override bespokeResolve(game: IGame) {
    const players = game.playersInGenerationOrder;
    const first = highestScorers(players, infrastructuresOf);
    for (const player of first) {
      player.increaseTerraformRating(2, {log: true});
    }
    const rest = players.filter((p) => !first.includes(p));
    for (const player of highestScorers(rest, infrastructuresOf)) {
      player.increaseTerraformRating(1, {log: true});
    }
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    lose(player, Resource.MEGACREDITS, 2 * infrastructuresOf(player), this);
  }
}
