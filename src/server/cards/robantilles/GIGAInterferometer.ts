import {digit} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ChooseCards} from '../../deferredActions/ChooseCards';
import {IGame} from '../../IGame';
import {SelectCard} from '../../inputs/SelectCard';
import {inplaceRemove} from '../../../common/utils/utils';
import {message} from '../../logs/MessageBuilder';

export class GIGAInterferometer extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GIGA_INTERFEROMETER,
      tags: [Tag.SCIENCE],
      cost: 0,

      metadata: {
        cardNumber: 'H52',
        renderData: CardRenderer.builder((b) => {
          b.text('research phase now', {size: Size.SMALL}).br;
          b.cards(4, {digit}).asterix().colon().megacredits(3).slash().cards(1);
        }),
        description: 'Requires that every player has at least 6 M€. A research phase begins immediately: ' +
          'every player draws 4 cards (drafting them if the game uses drafting) and may buy any of them for 3 M€ each.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    // The player's own M€ is checked after paying this card's cost of 0.
    return player.game.players.every((p) => p.megaCredits >= 6);
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    if (game.gameOptions.draftVariant && game.players.length > 1) {
      const hands = game.players.map(() => game.projectDeck.drawN(game, 4));
      const kept: Array<Array<IProjectCard>> = game.players.map(() => []);
      GIGAInterferometer.draftRound(game, hands, kept);
      return undefined;
    }
    for (const p of game.playersInGenerationOrder) {
      const cards = game.projectDeck.drawN(game, 4);
      game.defer(new ChooseCards(p, cards, {paying: true}));
    }
    return undefined;
  }

  /**
   * One round of the mini research draft: every player keeps 1 card from the hand they hold,
   * then the hands are passed in the same direction as this generation's research draft.
   * Players pick one after another (not at the same time), in player order.
   */
  private static draftRound(game: IGame, hands: Array<Array<IProjectCard>>, kept: Array<Array<IProjectCard>>) {
    const players = game.players;
    // Same as the standard research draft: even generations pass to the next player, odd ones to the previous.
    const step = game.generation % 2 === 0 ? 1 : -1;
    const n = players.length;
    players.forEach((p, i) => {
      p.defer(() => {
        const hand = hands[i];
        if (hand.length === 0) {
          return undefined;
        }
        const passTo = players[(i + step + n) % n];
        return new SelectCard(
          message('GIGA Interferometer draft: keep a card and pass the rest to ${0}', (b) => b.player(passTo)),
          'Keep', hand, {min: 1, max: 1, played: false})
          .andThen(([card]) => {
            kept[i].push(card);
            inplaceRemove(hand, card);
            return undefined;
          });
      });
    });
    players[0].defer(() => {
      // Pass every hand on.
      const passed = hands.map((_, i) => hands[(i - step + n) % n]);
      hands.splice(0, n, ...passed);
      if (hands.some((hand) => hand.length > 1)) {
        GIGAInterferometer.draftRound(game, hands, kept);
        return undefined;
      }
      // The last card of each hand goes to the player it's passed to, then everyone buys.
      hands.forEach((hand, i) => kept[i].push(...hand.splice(0)));
      for (const p of game.playersInGenerationOrder) {
        game.defer(new ChooseCards(p, kept[players.indexOf(p)], {paying: true}));
      }
      return undefined;
    });
  }
}
