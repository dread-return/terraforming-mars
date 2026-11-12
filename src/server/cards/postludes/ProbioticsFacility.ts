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

export class ProbioticsFacility extends PostludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.PROBIOTICS_FACILITY,
      type: CardType.ACTIVE,
      cost: 4,
      tags: [Tag.MICROBE, Tag.BUILDING],
      postludeKind: 'greenery',
      resourceType: CardResource.PROBIOTIC,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'L23',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 microbe from any card to add 1 probiotic to this card, OR spend 1 probiotic here to get 1 M€ for every generation reached.', (ab) => ab.resource(CardResource.MICROBE).startAction.resource(CardResource.PROBIOTIC).or().resource(CardResource.PROBIOTIC).colon().megacredits(1, {text: 'gen'}));
        }),
        description: 'Place the Probiotics Facility tile on top of one of your greeneries. Action: spend 1 microbe from any card to add 1 probiotic to this card, OR spend 1 probiotic here to get 1 M\u20ac for every generation reached. 1 VP for every 2 probiotics here.',
      },
    });
  }

  private microbeCards(player: IPlayer): Array<ICard> {
    return player.getCardsWithResources(CardResource.MICROBE);
  }

  public canAct(player: IPlayer): boolean {
    return this.microbeCards(player).length > 0 || this.resourceCount > 0;
  }

  public action(player: IPlayer) {
    const options = new OrOptions();
    options.title = 'Select an action for Probiotics Facility';
    if (this.microbeCards(player).length > 0) {
      options.options.push(new SelectOption('Spend a microbe to add a probiotic', 'Add probiotic').andThen(() => {
        return new SelectCard('Select a card to remove a microbe from', 'Remove', this.microbeCards(player))
          .andThen(([card]) => {
            player.removeResourceFrom(card, 1);
            player.addResourceTo(this, {qty: 1, log: true});
            return undefined;
          });
      }));
    }
    if (this.resourceCount > 0) {
      options.options.push(new SelectOption('Spend a probiotic to gain M€ for every generation reached', 'Spend probiotic').andThen(() => {
        player.removeResourceFrom(this, 1);
        player.stock.add(Resource.MEGACREDITS, player.game.generation, {log: true});
        return undefined;
      }));
    }
    return options.options.length === 1 ? options.options[0].cb() : options;
  }
}
