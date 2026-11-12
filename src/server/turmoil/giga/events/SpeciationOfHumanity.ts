import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {IGame} from '../../../IGame';
import {Size} from '../../../../common/cards/render/Size';
import {DiscardCards} from '../../../deferredActions/DiscardCards';
import {influenceOf, highestScorers} from './GigaEventHelpers';

export class SpeciationOfHumanity extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.SPECIATION_OF_HUMANITY,
      description: 'The player(s) with the most different tags (minus influence) discard 2 cards.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.BUREAUCRATS,
      renderData: CardRenderer.builder((b) => {
        b.diverseTag(1).influence({size: Size.SMALL}).colon().cards(-2);
      }),
    });
  }

  public override bespokeResolve(game: IGame) {
    const score = (player: IPlayer) => player.tags.distinctCount('globalEvent') - influenceOf(player);
    for (const player of highestScorers(game.playersInGenerationOrder, score)) {
      const count = Math.min(2, player.cardsInHand.length);
      if (count > 0) {
        game.defer(new DiscardCards(player, count, count, 'Speciation of Humanity Global Event - Discard cards'));
      }
    }
  }
}
