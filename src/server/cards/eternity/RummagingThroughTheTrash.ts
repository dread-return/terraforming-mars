import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectCard} from '../../inputs/SelectCard';

export class RummagingThroughTheTrash extends PreludeCard {
  constructor() {
    super({
      name: CardName.RUMMAGING_THROUGH_THE_TRASH,
      tags: [],
      behavior: {
        stock: {megacredits: 3},
      },
      metadata: {
        cardNumber: 'EP48',
        renderData: CardRenderer.builder((b) => {
          b.text('Play a discarded prelude.').megacredits(3);
        }),
        description: 'Choose and play a prelude that was discarded by your opponents. Gain 3 M\u20ac.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const pile = player.game.preludeDeck.discardPile;
    const options = pile.filter((c) => c.name !== this.name);
    if (options.length === 0) {
      return undefined;
    }
    player.defer(new SelectCard('Choose a discarded prelude to play', 'Play', options).andThen(([card]) => {
      pile.splice(pile.indexOf(card), 1);
      player.playCard(card);
      return undefined;
    }));
    return undefined;
  }
}
