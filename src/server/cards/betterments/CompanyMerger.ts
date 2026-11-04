import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';
import {LogHelper} from '../../LogHelper';

export class CompanyMerger extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COMPANY_MERGER,
      tags: [Tag.EARTH, Tag.BUILDING],
      cost: 77,
      victoryPoints: 2,

      metadata: {
        cardNumber: 'B53',
        renderData: CardRenderer.builder((b) => {
          b.text('2').corporation().asterix().nbsp.text('2').prelude().asterix();
        }),
        description: 'Draw 2 corporations and play 1 of them, including its starting M€, effects and actions. ' +
          'Draw 2 preludes and play 1 of them. Discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const corps = game.corporationDeck.drawN(game, 2);
    LogHelper.logDrawnCards(player, corps, /* privateMessage= */ true);
    if (corps.length > 0) {
      player.defer(() => new SelectCard('Choose a corporation to merge with', 'Merge', corps)
        .andThen(([corp]) => {
          // Lets the merged corporation add resources to itself, as with Merger.
          game.inDoubleDown = false;
          player.playCorporationCard(corp);
          for (const other of corps) {
            if (other.name !== corp.name) {
              game.corporationDeck.discard(other);
            }
          }
          return undefined;
        }));
    }
    player.defer(() => {
      const preludes = game.preludeDeck.drawN(game, 2);
      if (preludes.length === 0) {
        return undefined;
      }
      return PreludesExpansion.selectPreludeToPlay(player, preludes, 'discard');
    });
    return undefined;
  }
}
