import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Postludes} from '../../postludes/Postludes';
import {Size} from '../../../common/cards/render/Size';
import {Space} from '../../boards/Space';

export class ScienceInstitute extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.SCIENCE_INSTITUTE,
      type: CardType.ACTIVE,
      cost: 11,
      tags: [Tag.SCIENCE],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L17',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw a card for every empty tile adjacent to the Science Institute.', (ab) => ab.empty().startAction.cards(1).slash().emptyTile('normal', {size: Size.SMALL}).asterix());
        }),
        description: 'Place the Science Institute tile on top of one of your cities adjacent to at least 2 other tiles. Action: draw a card for every empty tile adjacent to the Science Institute.',
      },
    });
  }

  protected override spaceAllowed(player: IPlayer, space: Space): boolean {
    return Postludes.neighbors(player.game, space).filter((adjacent) => adjacent.tile !== undefined).length >= 2;
  }

  public canAct(player: IPlayer): boolean {
    return this.adjacentEmpty(player).length > 0;
  }

  public action(player: IPlayer) {
    player.drawCard(this.adjacentEmpty(player).length);
    return undefined;
  }
}
