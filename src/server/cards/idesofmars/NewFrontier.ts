import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';

export class NewFrontier extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.NEW_FRONTIER,
      tags: [Tag.SPACE],
      cost: 21,

      metadata: {
        cardNumber: 'I18',
        renderData: CardRenderer.builder((b) => {
          b.colonyTile().nbsp.colonies(1).asterix();
        }),
        description: 'Requires that every colony tile in play has at least 1 colony. ' +
          'Add a colony tile of your choice to the game and place a colony on it.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    const game = player.game;
    return game.discardedColonies.length > 0 &&
      game.colonies.every((colony) => colony.colonies.length > 0);
  }

  public override bespokePlay(player: IPlayer) {
    ColoniesHandler.addColonyTile(player, {
      title: 'Select a colony tile to add and colonize',
      activateableOnly: true,
      cb: (colony) => colony.addColony(player),
    });
    return undefined;
  }
}
