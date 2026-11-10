import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectCard} from '../../inputs/SelectCard';

export class GreetingCard extends PreludeCard {
  constructor() {
    super({
      name: CardName.GREETING_CARD,
      tags: [],
      metadata: {
        cardNumber: 'EP21',
        renderData: CardRenderer.builder((b) => {
          b.cards(4).text('keep 1').br.text('This generation:').megacredits(-25).projectRequirements();
        }),
        description: 'Reveal 4 cards. Keep one and discard the rest. You may play it this generation for up to 25 M\u20ac less, ignoring all global requirements (tag requirements still apply).',
      },
    });
  }

  public data: {card?: string, gen?: number} = {};
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawN(game, 4);
    player.defer(new SelectCard('Keep one card (play it this generation for up to 25 M€ less, ignoring global requirements)', 'Keep', cards, {min: 1, max: 1}).andThen(([card]) => {
      player.cardsInHand.push(card);
      game.projectDeck.discard(...cards.filter((c) => c !== card));
      this.data = {card: card.name, gen: game.generation};
      return undefined;
    }));
    return undefined;
  }
  private active(player: IPlayer, card: ICard) {
    return this.data.card === card.name && this.data.gen === player.game.generation;
  }
  public override getCardDiscount(player: IPlayer, card: IProjectCard): number {
    return this.active(player, card) ? 25 : 0;
  }
  public ignoresGlobalRequirementsFor(player: IPlayer, card: ICard): boolean {
    return this.active(player, card);
  }
  public onCardPlayed(_player: IPlayer, card: ICard) {
    if (card.name === this.data.card) {
      this.data = {};
    }
    return undefined;
  }
}
