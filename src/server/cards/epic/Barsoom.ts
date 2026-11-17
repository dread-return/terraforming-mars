import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

export class Barsoom extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BARSOOM,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 38,
      behavior: {
        production: {megacredits: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-BAR',
        description: 'You start with 38 M€ and 1 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38).production((pb) => pb.megacredits(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Take the top card of the discard pile into your hand.', (eb) => {
              eb.empty().startAction.cards(1).text('from discard', {size: Size.TINY});
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.game.projectDeck.discardPile.length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const card = player.game.projectDeck.discardPile.pop();
    if (card !== undefined) {
      player.cardsInHand.push(card);
      player.game.log('${0} took ${1} from the discard pile', (b) => b.player(player).card(card));
    }
    return undefined;
  }
}
