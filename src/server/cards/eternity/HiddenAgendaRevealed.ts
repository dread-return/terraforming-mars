import {ALL_TAGS} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class HiddenAgendaRevealed extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.HIDDEN_AGENDA_REVEALED,
      tags: [],
      cost: 4,
      requirements: {display: 'generation', count: 8, max: true},
      metadata: {
        cardNumber: 'E18',
        renderData: CardRenderer.builder((b) => {
          b.text('Reveal your hand. Name a tag. Reveal 12 cards and buy any with that tag.', {size: Size.SMALL, isBold: false});
        }),
        description: 'It must be generation 8 or earlier. Reveal your hand. Name a tag, reveal 12 cards and buy any of them with that tag at the normal price. Discard the rest.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.generation <= 8;
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.log('${0} revealed their hand: ${1}', (b) => b.player(player).cards(player.cardsInHand));
    const options = ALL_TAGS.filter((t) => t !== Tag.EVENT && t !== Tag.CLONE && t !== Tag.WILD).map((tag) => new SelectOption(tag).andThen(() => {
      const revealed: Array<IProjectCard> = game.projectDeck.drawN(game, 12);
      const matching = revealed.filter((c) => c.tags.includes(tag));
      const rest = revealed.filter((c) => !c.tags.includes(tag));
      game.projectDeck.discard(...rest);
      if (matching.length === 0) {
        game.log('${0} revealed no cards with that tag', (b) => b.player(player));
        return undefined;
      }
      const cost = player.cardCost;
      const max = Math.min(matching.length, Math.floor(player.spendableMegacredits() / cost));
      return new SelectCard('Select cards to buy (' + cost + ' M€ each)', 'Buy', matching, {min: 0, max: max}).andThen((bought) => {
        player.stock.deduct(Resource.MEGACREDITS, bought.length * cost);
        player.cardsInHand.push(...bought);
        game.projectDeck.discard(...matching.filter((c) => !bought.includes(c)));
        game.log('${0} bought ${1} card(s)', (b) => b.player(player).number(bought.length));
        return undefined;
      });
    }));
    return new OrOptions(...options).setTitle('Name a tag');
  }
}
