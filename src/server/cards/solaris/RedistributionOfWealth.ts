import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';

/** S21. */
export class RedistributionOfWealth extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.REDISTRIBUTION_OF_WEALTH,
      tags: [Tag.EARTH],
      cost: 3,
      requirements: {party: PartyName.POPULISTS},

      behavior: {
        production: {titanium: -1, megacredits: -1},
      },

      metadata: {
        cardNumber: 'S21',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().titanium(1).megacredits(1)).nbsp.prelude().asterix();
        }),
        description: 'Requires that Populists are ruling or that you have 2 delegates there. Decrease your titanium and M€ production 1 step each. Draw a prelude card and play it.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const preludes = game.preludeDeck.drawN(game, 1);
    if (preludes.length > 0) {
      player.defer(PreludesExpansion.selectPreludeToPlay(player, preludes, 'discard'));
    }
    return undefined;
  }
}
