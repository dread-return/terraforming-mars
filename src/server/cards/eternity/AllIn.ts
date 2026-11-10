import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';

export class AllIn extends PreludeCard {
  constructor() {
    super({
      name: CardName.ALL_IN,
      tags: [],
      metadata: {
        cardNumber: 'EP01',
        renderData: CardRenderer.builder((b) => {
          b.cards(5).colon().megacredits(3).slash().cards(1).asterix();
        }),
        description: 'Draw 5 cards. Keep any number of them and discard the rest. Gain 3 M\u20ac for each card discarded.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawN(game, 5);
    player.defer(new SelectCard('Keep any number of these cards (gain 3 M€ for each card discarded)', 'Keep', cards, {min: 0, max: cards.length}).andThen((kept) => {
      player.cardsInHand.push(...kept);
      const rest = cards.filter((c) => !kept.includes(c));
      game.projectDeck.discard(...rest);
      player.stock.add(Resource.MEGACREDITS, 3 * rest.length, {log: true});
      return undefined;
    }));
    return undefined;
  }
}
