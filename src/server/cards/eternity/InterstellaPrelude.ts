import {CardName as CN} from '../../../common/cards/CardName';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {newProjectCard} from '../../createCard';

export class InterstellaPrelude extends PreludeCard {
  constructor() {
    super({
      name: CardName.INTERSTELLA,
      tags: [],
      behavior: {
        stock: {megacredits: 8},
      },
      metadata: {
        cardNumber: 'EP03',
        renderData: CardRenderer.builder((b) => {
          b.cards(1).asterix().megacredits(8);
        }),
        description: 'Gain 8 M\u20ac and take the Interstella project card into your hand. (Interstella is not shuffled into the normal project deck.)',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const card = newProjectCard(CN.INTERSTELLA_PROJECT);
    if (card !== undefined) {
      player.cardsInHand.push(card);
      player.game.log('${0} took ${1} into their hand', (b) => b.player(player).card(card));
    }
    return undefined;
  }
}
