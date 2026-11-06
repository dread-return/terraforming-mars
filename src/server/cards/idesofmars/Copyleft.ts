import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {LogHelper} from '../../LogHelper';
import {all} from '../Options';
import {message} from '../../logs/MessageBuilder';

const PRICE = 3;

export class Copyleft extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.COPYLEFT,
      tags: [Tag.SCIENCE],
      cost: 5,

      metadata: {
        cardNumber: 'I15',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any science tag is played, reveal the top card of the deck. The player who played the tag may buy it for 3 M€. ' +
            'If they don\'t, you may buy it for 3 M€.', (eb) => {
            eb.tag(Tag.SCIENCE, {all}).startEffect.cards(1).asterix();
          });
        }),
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard, activePlayer: IPlayer) {
    const count = activePlayer.tags.cardTagCount(card, Tag.SCIENCE);
    for (let i = 0; i < count; i++) {
      activePlayer.defer(() => {
        this.reveal(thisCardOwner, activePlayer);
        return undefined;
      });
    }
    return undefined;
  }

  private reveal(owner: IPlayer, activePlayer: IPlayer) {
    const game = owner.game;
    const revealed = game.projectDeck.draw(game);
    if (revealed === undefined) {
      return;
    }
    LogHelper.logRevealedCards(owner, [revealed]);
    const discard = () => {
      game.projectDeck.discard(revealed);
      game.log('${0} was discarded', (b) => b.card(revealed));
    };
    const offerToOwner = () => {
      if (owner === activePlayer) {
        discard();
      } else {
        this.offer(owner, revealed, discard);
      }
    };
    this.offer(activePlayer, revealed, offerToOwner);
  }

  private offer(player: IPlayer, card: IProjectCard, onDecline: () => void) {
    if (!player.canAfford(PRICE)) {
      onDecline();
      return;
    }
    player.defer(new OrOptions(
      new SelectOption(message('Buy ${0} for ${1} M€', (b) => b.card(card).number(PRICE))).andThen(() => {
        player.game.defer(new SelectPaymentDeferred(player, PRICE, {title: message('Select how to pay for ${0}', (b) => b.card(card))}))
          .andThen(() => {
            player.cardsInHand.push(card);
            player.game.log('${0} bought ${1} (${2})', (b) => b.player(player).card(card).cardName(CardName.COPYLEFT));
          });
        return undefined;
      }),
      new SelectOption('Don\'t buy it').andThen(() => {
        onDecline();
        return undefined;
      }),
    ).setTitle(message('${0}: buy the revealed card?', (b) => b.cardName(CardName.COPYLEFT))));
  }
}
