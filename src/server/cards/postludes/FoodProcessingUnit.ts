import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {IActionCard} from '../ICard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';

export class FoodProcessingUnit extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.FOOD_PROCESSING_UNIT,
      type: CardType.ACTIVE,
      cost: 8,
      tags: [Tag.ANIMAL, Tag.BUILDING],
      postludeKind: 'city',
      resourceType: CardResource.FOOD,

      metadata: {
        cardNumber: 'L05',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (ab) => ab.plants(1).resource(CardResource.ANIMAL).startAction.resource(CardResource.FOOD)).br;
          b.or().br;
          b.action('Spend a plant and an animal to add a food here, OR remove a food here for 4 M€ per tile next to the Food Unit, and 1 TR.', (ab) => ab.resource(CardResource.FOOD).startAction.megacredits(4).slash().emptyTile('normal', {size: Size.SMALL}).tr(1));
        }),
        description: 'Place the Food Unit tile on one of your cities.',
      },
    });
  }

  private animalCards(player: IPlayer): Array<ICard> {
    return player.getCardsWithResources(CardResource.ANIMAL);
  }

  private canAddFood(player: IPlayer): boolean {
    return player.plants >= 1 && this.animalCards(player).length > 0;
  }

  public canAct(player: IPlayer): boolean {
    return this.canAddFood(player) || this.resourceCount > 0;
  }

  public action(player: IPlayer) {
    const options = new OrOptions();
    options.title = 'Select an action for Food Processing Unit';
    if (this.canAddFood(player)) {
      options.options.push(new SelectOption('Spend a plant and an animal to add a food', 'Add food').andThen(() => {
        return new SelectCard('Select a card to remove an animal from', 'Remove', this.animalCards(player))
          .andThen(([card]) => {
            player.stock.add(Resource.PLANTS, -1, {log: true});
            player.removeResourceFrom(card, 1);
            player.addResourceTo(this, {qty: 1, log: true});
            return undefined;
          });
      }));
    }
    if (this.resourceCount > 0) {
      options.options.push(new SelectOption('Remove a food to gain M€ and TR', 'Remove food').andThen(() => {
        const tiles = this.adjacentTiles(player).length;
        player.removeResourceFrom(this, 1);
        player.stock.add(Resource.MEGACREDITS, 4 * tiles, {log: true});
        player.increaseTerraformRating(1, {log: true});
        return undefined;
      }));
    }
    return options.options.length === 1 ? options.options[0].cb() : options;
  }
}
