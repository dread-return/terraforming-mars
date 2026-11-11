import {ALL_TAGS} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';

export class HeatFieldManipulator extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HEAT_FIELD_MANIPULATOR,
      tags: [Tag.SCIENCE, Tag.SPACE],
      cost: 7,
      requirements: [{tag: Tag.JOVIAN}, {tag: Tag.SCIENCE}],
      victoryPoints: 1,
      behavior: {
        production: {heat: 1},
      },
      metadata: {
        cardNumber: 'E74',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 2 heat and 2 M€ to name a tag. Reveal the top 4 cards of the deck, take any cards with that tag into your hand, and discard the rest.', (eb) => eb.heat(2, {digit}).megacredits(2).startAction.cards(4, {digit}).asterix()).br;
          b.production((pb) => pb.heat(1));
        }),
        description: 'Requires a Jovian tag and a science tag. Increase your heat production 1 step.',
      },
    });
  }

  public canAct(player: IPlayer) {
    return player.heat >= 2 && player.canAfford(2);
  }
  public action(player: IPlayer) {
    return new OrOptions(...ALL_TAGS.filter((t) => t !== Tag.CLONE && t !== Tag.WILD).map((tag) => new SelectOption(tag).andThen(() => {
      player.stock.deduct(Resource.HEAT, 2);
      player.stock.deduct(Resource.MEGACREDITS, 2);
      const game = player.game;
      const cards = game.projectDeck.drawN(game, 4);
      const keep = cards.filter((c) => c.tags.includes(tag));
      game.projectDeck.discard(...cards.filter((c) => !keep.includes(c)));
      player.cardsInHand.push(...keep);
      game.log('${0} revealed ${1} and kept ${2} card(s)', (b) => b.player(player).cards(cards).number(keep.length));
      return undefined;
    }))).setTitle('Name a tag');
  }
}
