import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TileType} from '../../../common/TileType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {CardResource} from '../../../common/CardResource';
import {SelectCard} from '../../inputs/SelectCard';
import {IProjectCard as ProjectCard} from '../IProjectCard';
import {RobAntillesTiles} from './RobAntillesTiles';
import {max} from '../Options';

export class LivestockGiantDome extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.LIVESTOCK_GIANT_DOME,
      tags: [Tag.BUILDING, Tag.ANIMAL],
      cost: 30,
      requirements: {oxygen: 7, max},
      tilesBuilt: [TileType.ANIMAL_DOME],

      metadata: {
        cardNumber: 'H33',
        renderData: CardRenderer.builder((b) => {
          b.tile(TileType.ANIMAL_DOME, false).asterix().nbsp;
          b.cards(1, {secondaryTag: Tag.ANIMAL}).text('free').asterix();
        }),
        description: 'Oxygen must be 7% or less. Place the Animal Dome tile on an area not next to any tile. ' +
          'Then you may play an active card that collects animals from your hand without paying its cost, ignoring its requirements. ' +
          'Adjacency bonus: 1 animal.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForType(player, 'isolated').length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return RobAntillesTiles.place(player, this.name, TileType.ANIMAL_DOME,
      player.game.board.getAvailableSpacesForType(player, 'isolated'),
      [SpaceBonus.ANIMAL], 'Select an isolated space for the Animal Dome', () => {
        player.defer(() => this.selectAnimalCard(player));
      });
  }

  private selectAnimalCard(player: IPlayer) {
    const cards = player.cardsInHand.filter((card) => card.type === CardType.ACTIVE && card.resourceType === CardResource.ANIMAL);
    if (cards.length === 0) {
      return undefined;
    }
    return new SelectCard<ProjectCard>('Select an animal card to play for free (or skip)', 'Play', cards, {min: 0, max: 1})
      .andThen(([card]) => {
        if (card !== undefined) {
          player.playCard(card);
        }
        return undefined;
      });
  }
}
