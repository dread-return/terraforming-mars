import {MoonExpansion} from '../../moon/MoonExpansion';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Size} from '../../../common/cards/render/Size';

export class CityProjectLibrary extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.CITY_PROJECT_LIBRARY,
      type: CardType.ACTIVE,
      cost: 7,
      tags: [Tag.EARTH, Tag.BUILDING],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L02',
        renderData: CardRenderer.builder((b) => {
          b.action('Replay an event of yours at 1 M€ less for each adjacent tile of yours to the Library. Then discard it.', (ab) => ab.empty().startAction.text('replay', {size: Size.SMALL}).cards(1, {secondaryTag: Tag.EVENT}).minus().megacredits(1, {text: 'x'}).asterix());
        }),
        description: 'Place the Library tile on top of one of your cities. Action: replay an event card of yours at 1 M\u20ac less for each adjacent tile of yours to the Library. Then discard it.',
      },
    });
  }

  private replayable(player: IPlayer): Array<IProjectCard> {
    const discount = this.ownAdjacentTiles(player).length;
    return player.playedCards.projects().filter((card) => {
      if (card.type !== CardType.EVENT || card.name === CardName.PRICE_WARS || card.name === CardName.SPECIAL_DESIGN || card.name === CardName.LAW_SUIT) {
        return false;
      }
      const cost = Math.max(0, player.getCardCost(card) - discount);
      const options = {cost, reserveUnits: MoonExpansion.adjustedReserveCosts(player, card)};
      return player.canAfford(options) && card.canPlay(player, options);
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.replayable(player).length > 0;
  }

  public action(player: IPlayer) {
    return new SelectCard<IProjectCard>('Select an event to replay', 'Replay', this.replayable(player), {played: false})
      .andThen(([card]) => {
        // Take the event out of play first, so it can't discount its own replay.
        player.playedCards.remove(card);
        const cost = Math.max(0, player.getCardCost(card) - this.ownAdjacentTiles(player).length);
        const replay = () => {
          player.playCard(card, undefined, 'nothing');
          player.game.projectDeck.discard(card);
          player.game.log('${0} replayed ${1} and discarded it', (b) => b.player(player).card(card));
        };
        if (cost > 0) {
          player.game.defer(new SelectPaymentDeferred(player, cost, {title: 'Select how to pay to replay the event'})).andThen(replay);
        } else {
          replay();
        }
        return undefined;
      });
  }
}
