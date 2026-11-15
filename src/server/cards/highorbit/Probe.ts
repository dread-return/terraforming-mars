import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {Resource} from '../../../common/Resource';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * Epic version: science tag, science resources instead of data.
 * Action: spend 1 M€ to discard the top card of the deck. A science tag on it adds a science resource to any card;
 * a space tag repeats the process.
 */
export class Probe extends InfrastructureCard implements IActionCard {
  constructor(copy: number = 1) {
    super(CardName.PROBE, copy, {
      tags: [Tag.SCIENCE],
      resourceType: CardResource.SCIENCE,
      victoryPoints: {resourcesHere: {}, per: 2},
      metadata: {
        cardNumber: 'HO61',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 M€: discard the top card of the deck. Science tag: add a science resource to ANY card. Space tag: repeat.', (eb) => {
            eb.megacredits(1).startAction.cards(1).asterix();
          }).br;
          b.vpText('1 VP for every 2 science resources on this card.');
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.megaCredits >= 1;
  }

  public action(player: IPlayer) {
    const game = player.game;
    player.stock.deduct(Resource.MEGACREDITS, 1);
    // A space tag repeats the process; stop when the deck runs out.
    for (let i = 0; i < 500; i++) {
      const card = game.projectDeck.draw(game);
      if (card === undefined) {
        break;
      }
      game.projectDeck.discard(card);
      game.log('${0} discarded ${1} with ${2}', (b) => b.player(player).card(card).card(this));
      if (card.tags.includes(Tag.SCIENCE)) {
        game.defer(new AddResourcesToCard(player, CardResource.SCIENCE, {count: 1}));
      }
      if (!card.tags.includes(Tag.SPACE)) {
        break;
      }
    }
    return undefined;
  }
}
