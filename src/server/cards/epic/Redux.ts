import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class Redux extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.REDUX,
      startingMegaCredits: 42,
      initialActionText: 'Draw a card; keep it, or discard it and draw a replacement',
      action: {},

      metadata: {
        cardNumber: 'EP-RDX',
        description: 'You start with 42 M€. First action: draw a card; keep it, or discard it and draw a replacement.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).cards(1).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Spend 6 M€ to return one of your played automated (green) cards to your hand.', (eb) => {
              eb.megacredits(6).startAction.cards(1, {secondaryTag: AltSecondaryTag.GREEN}).asterix();
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const card = game.projectDeck.draw(game);
    if (card === undefined) {
      return undefined;
    }
    return new OrOptions(
      new SelectOption(`Keep ${card.name}`, 'Keep').andThen(() => {
        keep(player, [card], [], LogType.DREW);
        return undefined;
      }),
      new SelectOption(`Discard ${card.name} and draw a replacement`, 'Redraw').andThen(() => {
        game.projectDeck.discard(card);
        player.drawCard();
        return undefined;
      }),
    ).setTitle('Redux: first action');
  }

  private automated(player: IPlayer): Array<IProjectCard> {
    return player.playedCards.asArray().filter((c): c is IProjectCard => c.type === CardType.AUTOMATED);
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford(6) && this.automated(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Redux: return an automated card to your hand', 'Return', this.automated(player)).andThen(([card]) => {
      player.game.defer(new SelectPaymentDeferred(player, 6).andThen(() => {
        player.playedCards.remove(card);
        player.cardsInHand.push(card);
        player.game.log('${0} returned ${1} to their hand', (b) => b.player(player).card(card));
      }));
      return undefined;
    });
  }
}
