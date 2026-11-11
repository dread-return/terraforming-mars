import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';

export class DocumentationError extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.DOCUMENTATION_ERROR,
      tags: [],
      cost: 3,
      metadata: {
        cardNumber: 'E09',
        renderData: CardRenderer.builder((b) => {
          b.text('Each opponent may pay you 5 M€ to skip this. All players who did not pay (including you) put 2 random cards from hand face down (drawing first if they have fewer than 2), shuffle them, and deal 2 back to each.', {size: Size.SMALL, isBold: false});
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const shufflers: Array<IPlayer> = [player];
    for (const opponent of player.opponents) {
      opponent.defer(() => {
        const join = new SelectOption('Join the shuffle').andThen(() => {
          shufflers.push(opponent);
          return undefined;
        });
        if (opponent.megaCredits < 5) {
          shufflers.push(opponent);
          return undefined;
        }
        return new OrOptions(
          new SelectOption(`Pay 5 M€ to ${player.name} to stay out`).andThen(() => {
            opponent.stock.deduct(Resource.MEGACREDITS, 5, {log: true});
            player.stock.add(Resource.MEGACREDITS, 5, {log: true});
            return undefined;
          }),
          join,
        ).setTitle('Documentation "Error": pay 5 M€ or put 2 random cards into the shuffle');
      });
    }
    player.defer(() => {
      DocumentationError.shuffle(shufflers);
      return undefined;
    });
    return undefined;
  }
  /** Each shuffler gives 2 random cards (topping up from the deck first), then 2 are dealt back to each. */
  public static shuffle(shufflers: ReadonlyArray<IPlayer>) {
    if (shufflers.length < 2) {
      return;
    }
    const game = shufflers[0].game;
    const pool: Array<IProjectCard> = [];
    for (const p of shufflers) {
      if (p.cardsInHand.length < 2) {
        p.drawCard(2 - p.cardsInHand.length);
      }
      for (let i = 0; i < 2 && p.cardsInHand.length > 0; i++) {
        const idx = game.rng.nextInt(p.cardsInHand.length);
        pool.push(...p.cardsInHand.splice(idx, 1));
      }
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = game.rng.nextInt(i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (const p of shufflers) {
      p.cardsInHand.push(...pool.splice(0, 2));
    }
    game.log('${0} players shuffled 2 cards each and were dealt 2 back', (b) => b.number(shufflers.length));
  }
}
