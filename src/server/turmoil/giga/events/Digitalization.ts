import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';
import {SelectCard} from '../../../inputs/SelectCard';
import {IActionCard, ICard, isIActionCard, isIHasCheckLoops} from '../../../cards/ICard';
import {influenceOf, citiesOf, lose} from './GigaEventHelpers';

/** Played action cards the player can use now, whether or not they were already used this generation. */
function actionCards(player: IPlayer): Array<IActionCard & ICard> {
  const result: Array<IActionCard & ICard> = [];
  for (const card of player.tableau) {
    if (!isIActionCard(card)) {
      continue;
    }
    if (isIHasCheckLoops(card) && card.getCheckLoops() >= 2) {
      continue;
    }
    if (card.canAct(player)) {
      result.push(card);
    }
  }
  return result;
}

function activateAgain(player: IPlayer, remaining: number): void {
  player.defer(() => {
    const cards = actionCards(player);
    if (cards.length === 0) {
      return undefined;
    }
    const options = new OrOptions(
      new SelectCard('Select an active card to activate again', 'Take action', cards)
        .andThen(([card]) => {
          player.game.log('${0} activated ${1} again for Digitalization', (b) => b.player(player).card(card));
          const result = card.action(player);
          // Queued after the card's own effects, so those resolve first.
          if (remaining > 1) {
            activateAgain(player, remaining - 1);
          }
          return result;
        }),
      new SelectOption('Do not activate another card').andThen(() => undefined));
    options.setTitle('Digitalization Global Event - activate a card again');
    return options;
  });
}

export class Digitalization extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.DIGITALIZATION,
      description: 'Lose 2 M€ per city and colony you own (max 5, then reduced by influence). Activate 2 of your active cards again.',
      revealedDelegate: PartyName.TRANSHUMANISTS,
      currentDelegate: PartyName.SPOME,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(-2).slash().city().plus().colonies(1).influence({size: Size.SMALL}).br;
        b.text('Activate 2 cards again', {size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const count = Math.min(5, citiesOf(player) + player.getColoniesCount());
    lose(player, Resource.MEGACREDITS, 2 * Math.max(0, count - influenceOf(player)), this);
    activateAgain(player, 2);
  }
}
