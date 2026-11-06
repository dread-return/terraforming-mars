import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Deck} from '../Deck';

const CHOOSABLE_TAGS: ReadonlyArray<Tag> = [
  Tag.BUILDING, Tag.SPACE, Tag.SCIENCE, Tag.POWER, Tag.EARTH, Tag.JOVIAN, Tag.VENUS, Tag.PLANT,
  Tag.MICROBE, Tag.ANIMAL, Tag.CITY, Tag.MOON, Tag.MARS, Tag.RADIOACTIVE, Tag.MERCURY, Tag.CRIME,
];

export class TargetedResearch extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TARGETED_RESEARCH,
      tags: [Tag.SCIENCE],
      cost: 6,

      metadata: {
        cardNumber: 'I03',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {secondaryTag: Tag.WILD}).asterix();
        }),
        description: 'Choose a tag (not Galactic). Reveal cards from the deck until you reveal a card with that tag. ' +
          'Put it into your hand and shuffle the rest back into the deck.',
      },
    });
  }

  /** Tags that at least one card in the draw pile has. */
  private availableTags(player: IPlayer): Array<Tag> {
    const drawPile = player.game.projectDeck.drawPile;
    return CHOOSABLE_TAGS.filter((tag) => drawPile.some((card) => card.tags.includes(tag)));
  }

  public override bespokePlay(player: IPlayer) {
    const tags = this.availableTags(player);
    if (tags.length === 0) {
      player.game.log('No card in the deck has a tag ${0} can search for', (b) => b.player(player));
      return undefined;
    }
    return new OrOptions(...tags.map((tag) => new SelectOption(`Search for a ${tag} tag`).andThen(() => {
      this.search(player, tag);
      return undefined;
    }))).setTitle('Choose a tag to search the deck for');
  }

  private search(player: IPlayer, tag: Tag) {
    const game = player.game;
    const drawPile = game.projectDeck.drawPile;
    // The top of the deck is the end of the array.
    for (let i = drawPile.length - 1; i >= 0; i--) {
      if (drawPile[i].tags.includes(tag)) {
        const [card] = drawPile.splice(i, 1);
        player.cardsInHand.push(card);
        Deck.shuffle(drawPile, game.rng);
        game.log('${0} searched the deck for a ${1} tag and took a card', (b) => b.player(player).string(tag));
        player.game.log('You took ${0}', (b) => b.card(card), {reservedFor: player});
        return;
      }
    }
  }
}
