import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {IProjectCard} from '../IProjectCard';

export class TwoHeadsAreBetterThanOne extends ActCard {
  constructor() {
    super({
      name: CardName.TWO_HEADS_ARE_BETTER_THAN_ONE,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.SCIENCE],
      metadata: {
        cardNumber: 'ACT13',
        renderData: CardRenderer.builder((b) => {
          b.text('reveal', {size: Size.SMALL}).cards(1).text('per player + 3', {size: Size.SMALL}).asterix();
        }),
        description: 'Resolve: reveal 1 card per player + 3 from the deck. Out of them both of you choose 2 cards, then the other players choose 1 (in player order).',
      },
    });
  }

  public override resolveTreaty(owner: IPlayer, other: IPlayer | undefined) {
    const game = owner.game;
    const revealed: Array<IProjectCard> = game.projectDeck.drawN(game, game.players.length + 3);
    game.log('${0} revealed ${1}', (b) => b.card(this).cards(revealed));
    const order = [owner, ...(other === undefined ? [] : [other]), ...game.playersInGenerationOrder.filter((p) => p !== owner && p !== other)];
    for (const p of order) {
      const count = p === owner || p === other ? 2 : 1;
      p.defer(() => {
        if (revealed.length === 0) {
          return undefined;
        }
        const max = Math.min(count, revealed.length);
        return new SelectCard(`Two Heads Are Better Than One: choose ${max} card(s)`, 'Take', revealed, {min: max, max}).andThen((cards) => {
          for (const card of cards) {
            revealed.splice(revealed.indexOf(card), 1);
            p.cardsInHand.push(card);
          }
          game.log('${0} took ${1} card(s)', (b) => b.player(p).number(cards.length));
          if (p === order[order.length - 1] && revealed.length > 0) {
            game.projectDeck.discard(...revealed);
          }
          return undefined;
        });
      });
    }
  }
}
