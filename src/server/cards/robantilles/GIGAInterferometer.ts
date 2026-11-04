import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ChooseCards} from '../../deferredActions/ChooseCards';

export class GIGAInterferometer extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GIGA_INTERFEROMETER,
      tags: [Tag.SCIENCE],
      cost: 0,

      metadata: {
        cardNumber: 'H52',
        renderData: CardRenderer.builder((b) => {
          b.text('research phase now');
        }),
        description: 'Requires that every player has at least 6 M€. A research phase begins immediately: ' +
          'in turn order, every player draws 4 cards and may buy any of them for 3 M€ each.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    // The player's own M€ is checked after paying this card's cost of 0.
    return player.game.players.every((p) => p.megaCredits >= 6);
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    for (const p of game.playersInGenerationOrder) {
      const cards = game.projectDeck.drawN(game, 4);
      game.defer(new ChooseCards(p, cards, {paying: true}));
    }
    return undefined;
  }
}
