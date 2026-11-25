import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SpaceId} from '../../../common/Types';
import {digit} from '../Options';
import {SelectSpace} from '../../inputs/SelectSpace';
import {GameSetup} from '../../GameSetup';
import {message} from '../../logs/MessageBuilder';

export class RedRailNetwork extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.RED_RAIL_NETWORK,
      tags: [Tag.BUILDING],
      startingMegaCredits: 30,

      behavior: {
        stock: {steel: 10},
      },

      action: {},

      metadata: {
        cardNumber: 'EP-RRN',
        description: 'You start with 30 M€ and 10 steel.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).steel(10, {digit});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('After you play another building card, mark a free land area as rail, next to your tiles or rails if possible. Only you may build there.', (eb) => {
              eb.tag(Tag.BUILDING).startEffect.emptyTile('normal', {size: Size.SMALL}).text('rail', {size: Size.SMALL, uppercase: true});
            });
            ce.action('Your rails joining 2 cities become neutral: +1 M€ production per rail.', (eb) => {
              eb.text('-X', {size: Size.MEDIUM}).text('rail', {size: Size.SMALL, uppercase: true}).asterix().startAction.production((pb) => pb.megacredits(0, {text: 'x'}));
            });
          });
        }),
      },
    });
  }

  /** The spaces holding this card's rail markers. */
  public data: {rails?: Array<SpaceId>} = {};

  private rails(player: IPlayer): Array<Space> {
    const board = player.game.board;
    return (this.data.rails ?? []).map((id) => board.getSpaceOrThrow(id)).filter((space) => space.tile === undefined && space.player === player);
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.name === this.name || !card.tags.includes(Tag.BUILDING)) {
      return undefined;
    }
    const board = player.game.board;
    const free = board.getAvailableSpacesOnLand(player).filter((space) => space.tile === undefined && space.player === undefined);
    if (free.length === 0) {
      return undefined;
    }
    const mine = (s: Space) => (s.player === player);
    const next = free.filter((space) => board.getAdjacentSpaces(space).some(mine));
    player.defer(new SelectSpace('Red Rail Network: select an area for a rail marker', next.length > 0 ? next : free).andThen((space) => {
      space.player = player;
      this.data.rails = [...(this.data.rails ?? []), space.id];
      player.game.log('${0} put a rail marker on ${1}', (b) => b.player(player).space(space));
      return undefined;
    }));
    return undefined;
  }

  /** Railways: shortest chains of this player's rail markers that join two different cities. */
  public railways(player: IPlayer): Array<{from: Space, to: Space, path: Array<Space>}> {
    const board = player.game.board;
    const rails = this.rails(player);
    const railIds = new Set(rails.map((s) => s.id));
    const cities = board.spaces.filter((s) => Board.isCitySpace(s) && s.spaceType !== SpaceType.COLONY);
    const result: Array<{from: Space, to: Space, path: Array<Space>}> = [];
    const seen = new Set<string>();
    for (const city of cities) {
      // Breadth-first search over rail markers, starting next to this city.
      const parent = new Map<SpaceId, SpaceId | undefined>();
      const queue: Array<Space> = [];
      for (const s of board.getAdjacentSpaces(city)) {
        if (railIds.has(s.id) && !parent.has(s.id)) {
          parent.set(s.id, undefined);
          queue.push(s);
        }
      }
      for (let current = queue.shift(); current !== undefined; current = queue.shift()) {
        for (const other of board.getAdjacentSpaces(current)) {
          if (other !== city && Board.isCitySpace(other) && other.spaceType !== SpaceType.COLONY) {
            const key = [city.id, other.id].sort().join('-');
            if (!seen.has(key)) {
              seen.add(key);
              const path: Array<Space> = [];
              let id: SpaceId | undefined = current.id;
              while (id !== undefined) {
                path.push(board.getSpaceOrThrow(id));
                id = parent.get(id);
              }
              result.push({from: city, to: other, path});
            }
          }
          if (railIds.has(other.id) && !parent.has(other.id)) {
            parent.set(other.id, current.id);
            queue.push(other);
          }
        }
      }
    }
    return result;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.railways(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const complete = (railway: {from: Space, to: Space, path: Array<Space>}) => {
      const neutral = GameSetup.neutralPlayerFor(player.game.id);
      for (const space of railway.path) {
        space.player = neutral;
      }
      const ids = railway.path.map((s) => s.id);
      this.data.rails = (this.data.rails ?? []).filter((id) => !ids.includes(id));
      player.production.add(Resource.MEGACREDITS, railway.path.length, {log: true});
      player.game.log('${0} completed a railway between ${1} and ${2}', (b) => b.player(player).space(railway.from).space(railway.to));
      return undefined;
    };
    const railways = this.railways(player);
    if (railways.length === 1) {
      return complete(railways[0]);
    }
    return new OrOptions(...railways.map((railway) =>
      new SelectOption(message('Railway ${0} – ${1} (${2} markers)', (b) => b.space(railway.from).space(railway.to).number(railway.path.length)), 'Complete')
        .andThen(() => complete(railway)),
    )).setTitle('Red Rail Network: complete a railway');
  }
}
