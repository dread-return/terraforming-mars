import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {PostludeCard} from './PostludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IActionCard} from '../ICard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';

export class FlightAcademy extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.FLIGHT_ACADEMY,
      type: CardType.ACTIVE,
      cost: 10,
      tags: [Tag.JOVIAN, Tag.SPACE],
      postludeKind: 'city',

      metadata: {
        cardNumber: 'L04',
        renderData: CardRenderer.builder((b) => {
          b.action('You may transfer a resource between two active cards holding the same type.', (ab) => ab.cards(1, {text: 'x'}).startAction.arrow().cards(1, {text: 'y'}));
        }),
        description: 'Place the Flight Academy tile on top of one of your cities. Action: you may transfer a resource between two cards of yours holding the same type of resource.',
      },
    });
  }

  /** The resource types with a card that has some and another card that can hold it. */
  private transferable(player: IPlayer): Array<ICard> {
    return player.getCardsWithResources().filter((source) =>
      source.resourceType !== undefined && this.targets(player, source).length > 0);
  }

  private targets(player: IPlayer, source: ICard): Array<ICard> {
    return player.getResourceCards(source.resourceType).filter((card) => card !== source);
  }

  public canAct(player: IPlayer): boolean {
    return this.transferable(player).length > 0;
  }

  public action(player: IPlayer) {
    return new SelectCard('Select the card to take a resource from', 'Select', this.transferable(player))
      .andThen(([source]) => {
        return new SelectCard('Select the card to move it to', 'Move', this.targets(player, source))
          .andThen(([target]) => {
            player.removeResourceFrom(source, 1);
            player.addResourceTo(target, {qty: 1, log: true});
            player.game.log('${0} moved a resource from ${1} to ${2}', (b) => b.player(player).card(source).card(target));
            return undefined;
          });
      });
  }
}
