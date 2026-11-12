import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {CardType} from '../../../../common/cards/CardType';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {RemoveResourcesFromCard} from '../../../deferredActions/RemoveResourcesFromCard';
import {SelectCard} from '../../../inputs/SelectCard';
import {influenceOf, automatedCardsOf, lose, chooseOne, Choice} from './GigaEventHelpers';

export class BeltTighteningPolicy extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.BELT_TIGHTENING_POLICY,
      description: 'Lose 2 M€ per 2 automated cards you have, reduced by influence. Discard 1 active card from your hand or remove 2 card resources.',
      revealedDelegate: PartyName.CENTRISTS,
      currentDelegate: PartyName.POPULISTS,
      renderData: CardRenderer.builder((b) => {
        b.megacredits(-2).slash().text('2 automated', {size: Size.SMALL}).influence({size: Size.SMALL}).br;
        b.cards(-1).slash().text('2 resources', {size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    const sets = Math.max(0, Math.floor(automatedCardsOf(player) / 2) - influenceOf(player));
    lose(player, Resource.MEGACREDITS, 2 * sets, this);

    const game = player.game;
    const choices: Array<Choice> = [];
    const activeCards = player.cardsInHand.filter((card) => card.type === CardType.ACTIVE);
    if (activeCards.length > 0) {
      choices.push({
        title: 'Discard an active card from your hand',
        apply: () => player.defer(new SelectCard('Select an active card to discard', 'Discard', activeCards)
          .andThen(([card]) => {
            player.discardCardFromHand(card, {log: true});
            return undefined;
          })),
      });
    }
    const resources = player.getCardsWithResources().reduce((sum, card) => sum + card.resourceCount, 0);
    if (resources >= 2) {
      choices.push({
        title: 'Remove 2 card resources',
        apply: () => {
          for (let i = 0; i < 2; i++) {
            game.defer(new RemoveResourcesFromCard(player, undefined, 1, {source: 'self', blockable: false}));
          }
        },
      });
    }
    chooseOne(player, 'Belt Tightening Policy Global Event - select what to give up', choices);
  }
}
