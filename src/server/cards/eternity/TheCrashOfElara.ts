import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {SelectColony} from '../../inputs/SelectColony';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';

export class TheCrashOfElara extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.THE_CRASH_OF_ELARA,
      tags: [Tag.JOVIAN, Tag.SPACE, Tag.EVENT],
      cost: 38,
      behavior: {
        global: {temperature: 2},
        stock: {titanium: 2, steel: 2, heat: 4},
      },
      metadata: {
        cardNumber: 'E130',
        renderData: CardRenderer.builder((b) => {
          b.text('Remove a colony tile. Colony owners: 4 titanium per colony there.', {size: Size.SMALL}).br.temperature(2).titanium(2).steel(2).heat(4);
        }),
        description: 'Remove a colony tile from the game. Each player who had colonies on it gains 4 titanium per colony. Raise the temperature 2 steps. Gain 2 titanium, 2 steel and 4 heat.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.colonies.length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    return new SelectColony('Select a colony tile to remove from the game', 'Remove', game.colonies.slice()).andThen((colony) => {
      for (const id of colony.colonies) {
        game.getPlayerById(id).stock.add(Resource.TITANIUM, 4, {log: true});
      }
      game.colonies.splice(game.colonies.indexOf(colony), 1);
      game.discardedColonies.push(colony);
      game.log('${0} removed ${1} from the game', (b) => b.player(player).colony(colony));
      return undefined;
    });
  }
}
