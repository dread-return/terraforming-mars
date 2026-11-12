import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {Board} from '../../boards/Board';
import {CardResource} from '../../../common/CardResource';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';

export class AnimalFarm extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.ANIMAL_FARM,
      type: CardType.ACTIVE,
      cost: 5,
      tags: [Tag.ANIMAL, Tag.BUILDING],
      postludeKind: 'greenery',
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'L20',
        renderData: CardRenderer.builder((b) => {
          b.action('Add an animal to this card for every greenery adjacent to the Animal Farm.', (ab) => ab.empty().startAction.resource(CardResource.ANIMAL).slash().greenery({size: Size.SMALL}).asterix());
        }),
        description: 'Place the Animal Farm tile on top of one of your greeneries adjacent to at least 2 cities. Action: add an animal to this card for every greenery adjacent to the Animal Farm. 1 VP for every 2 animals here.',
      },
    });
  }

  protected override spaceAllowed(player: IPlayer, space: Space): boolean {
    return Postludes.neighbors(player.game, space).filter(Board.isCitySpace).length >= 2;
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentGreeneryCount(player) > 0;
  }

  public action(player: IPlayer) {
    player.addResourceTo(this, {qty: this.adjacentGreeneryCount(player), log: true});
    return undefined;
  }
}
