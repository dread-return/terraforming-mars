import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard, ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {IdesOfMars} from './IdesOfMars';
import {all} from '../Options';

const TYPES: ReadonlyArray<CardResource> = [CardResource.FLOATER, CardResource.FIGHTER];

export class UniversalFighters extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.UNIVERSAL_FIGHTERS,
      tags: [Tag.VENUS, Tag.SPACE],
      cost: 8,
      resourceType: CardResource.FIGHTER,
      victoryPoints: {resourcesHere: {}, per: 2},

      behavior: {
        addResources: 2,
      },

      metadata: {
        cardNumber: 'I68',
        renderData: CardRenderer.builder((b) => {
          b.action('Remove a floater or a fighter from any card to add a floater or a fighter to any of your cards.', (eb) => {
            eb.resource(CardResource.FLOATER, {all}).slash().resource(CardResource.FIGHTER, {all})
              .startAction.resource(CardResource.FLOATER).slash().resource(CardResource.FIGHTER).asterix();
          }).br;
          b.resource(CardResource.FIGHTER, 2);
        }),
        description: 'Add 2 fighters to this card. 1 VP per 2 fighters here.',
      },
    });
  }

  private sources(player: IPlayer) {
    return IdesOfMars.cardsWithResources(player.game, TYPES)
      .filter(({owner, card}) => owner === player || card.protectedResources !== true);
  }

  private targets(player: IPlayer): Array<ICard> {
    return [...player.getResourceCards(CardResource.FLOATER), ...player.getResourceCards(CardResource.FIGHTER)];
  }

  public canAct(player: IPlayer) {
    return this.sources(player).length > 0;
  }

  public action(player: IPlayer) {
    const sources = this.sources(player);
    return new SelectCard('Select a card to remove a floater or a fighter from', 'Remove', sources.map((s) => s.card), {showOwner: true})
      .andThen(([card]) => {
        const owner = sources.find((s) => s.card.name === card.name)?.owner ?? player;
        owner.removeResourceFrom(card, 1, {removingPlayer: player, log: true});
        // The card just used may now hold none, but it is still a valid target.
        return new SelectCard('Select a card to add a floater or a fighter to', 'Add', this.targets(player))
          .andThen(([target]) => {
            player.addResourceTo(target, {qty: 1, log: true});
            return undefined;
          });
      });
  }
}
