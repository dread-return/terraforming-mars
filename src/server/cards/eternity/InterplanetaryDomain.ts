import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {PlayerInput} from '../../PlayerInput';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class InterplanetaryDomain extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.INTERPLANETARY_DOMAIN,
      tags: [Tag.MARS, Tag.EARTH, Tag.VENUS],
      cost: 40,
      requirements: [{tag: Tag.MARS}, {tag: Tag.EARTH}, {tag: Tag.VENUS}],
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E80',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.MARS}).cards(1, {secondaryTag: Tag.EARTH}).cards(1, {secondaryTag: Tag.VENUS}).asterix();
        }),
        description: 'Requires a Mars, an Earth and a Venus tag. Reveal cards until you reveal a Mars-tag, an Earth-tag and a Venus-tag card that each cost less than 25 M\u20ac. You may play each of them ignoring cost and requirements. Discard the rest.',
      },
    });
  }

  private reveal(player: IPlayer, tag: Tag): IProjectCard | undefined {
    const game = player.game;
    const deck = game.projectDeck;
    const discarded: Array<IProjectCard> = [];
    let found: IProjectCard | undefined;
    for (let i = 0; i < 300 && found === undefined; i++) {
      const card = deck.draw(game);
      if (card === undefined) {
        break;
      }
      if (card.tags.includes(tag) && card.cost < 25) {
        found = card;
      } else {
        discarded.push(card);
      }
    }
    deck.discard(...discarded);
    return found;
  }
  public override bespokePlay(player: IPlayer) {
    const cards = [Tag.MARS, Tag.EARTH, Tag.VENUS].map((t) => this.reveal(player, t)).filter((c): c is IProjectCard => c !== undefined);
    player.game.log('${0} revealed ${1}', (b) => b.player(player).cards(cards));
    const offer = (i: number): PlayerInput | undefined => {
      const card = cards[i];
      if (card === undefined) {
        return undefined;
      }
      const discard = new SelectOption(`Discard ${card.name}`).andThen(() => {
        player.game.projectDeck.discard(card);
        player.defer(() => offer(i + 1));
        return undefined;
      });
      if (!card.canPlayPostRequirements(player, {cost: 0})) {
        return discard.cb(undefined);
      }
      return new OrOptions(new SelectOption(`Play ${card.name} for free`).andThen(() => {
        player.playCard(card);
        player.defer(() => offer(i + 1));
        return undefined;
      }), discard).setTitle('Interplanetary Domain');
    };
    player.defer(() => offer(0));
    return undefined;
  }
}
