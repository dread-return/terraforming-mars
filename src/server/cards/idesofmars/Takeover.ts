import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {LogHelper} from '../../LogHelper';
import {Resource} from '../../../common/Resource';

export class Takeover extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TAKEOVER,
      tags: [Tag.EARTH],
      cost: 35,
      requirements: {display: 'generation', count: 5},

      metadata: {
        cardNumber: 'I60',
        renderData: CardRenderer.builder((b) => {
          b.text('5').corporation().asterix().nbsp.minus().megacredits(25);
        }),
        description: 'Requires that it is at least generation 5. Draw 5 corporation cards and play 1 of them, ' +
          'including its actions, bonuses and starting M€ minus 25. Discard the rest.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.generation >= 5;
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const corps = game.corporationDeck.drawN(game, 5);
    LogHelper.logDrawnCards(player, corps, /* privateMessage= */ true);
    if (corps.length === 0) {
      return undefined;
    }
    player.defer(() => new SelectCard('Choose a corporation to take over', 'Take over', corps)
      .andThen(([corp]) => {
        // Lets the new corporation add resources to itself, as with Merger.
        game.inDoubleDown = false;
        player.playCorporationCard(corp);
        for (const other of corps) {
          if (other.name !== corp.name) {
            game.corporationDeck.discard(other);
          }
        }
        const penalty = Math.min(25, player.megaCredits);
        player.stock.deduct(Resource.MEGACREDITS, penalty);
        game.log('${0} paid ${1} M€ of the starting M€ of ${2} (${3})', (b) => b.player(player).number(penalty).card(corp).card(this));
        return undefined;
      }));
    return undefined;
  }
}
