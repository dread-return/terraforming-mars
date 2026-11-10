import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class EngineeredPolarAsteroids extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ENGINEERED_POLAR_ASTEROIDS,
      tags: [Tag.SCIENCE, Tag.SPACE, Tag.EVENT],
      cost: 21,
      requirements: {tag: Tag.SCIENCE, count: 2},
      behavior: {
        global: {temperature: 2},
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E67',
        renderData: CardRenderer.builder((b) => {
          b.temperature(2).cards(1).br.text('Tiles on the top or bottom row:').production((pb) => pb.minus().plants(1, {all}));
        }),
        description: "Requires 2 science tags. Raise the temperature 2 steps. Draw a card. Every player with a tile on Mars' top or bottom row decreases their plant production 1 step.",
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const board = player.game.board;
    const rows = board.spaces.filter((s) => s.spaceType !== 'colony' && s.y >= 0);
    const minY = Math.min(...rows.map((s) => s.y));
    const maxY = Math.max(...rows.map((s) => s.y));
    const owners = new Set<IPlayer>();
    for (const s of rows) {
      if ((s.y === minY || s.y === maxY) && s.player !== undefined && s.tile !== undefined) {
        owners.add(s.player);
      }
    }
    owners.forEach((p) => {
      if (p.production.plants > 0) {
        p.production.add(Resource.PLANTS, -1, {log: true, from: {player}});
      }
    });
    return undefined;
  }
}
