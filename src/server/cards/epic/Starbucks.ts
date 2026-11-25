import * as VP from '../render/DynamicVictoryPoints';
import {GREENERY_TILES} from '../../../common/TileType';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SpaceId} from '../../../common/Types';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';
import {message} from '../../logs/MessageBuilder';

export class Starbucks extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.STARBUCKS,
      tags: [Tag.BUILDING, Tag.EARTH],
      startingMegaCredits: 40,
      victoryPoints: 'special',

      action: {},

      metadata: {
        cardNumber: 'EP-SBX',
        description: 'You start with 40 M€. 1 VP per city with at least 1 Starbucks.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Any greenery placed: you may pay its owner 3 M€ (free if yours) to put coffee on it.', (eb) => {
              eb.greenery({size: Size.SMALL, withO2: false, any: true}).slash().megacredits(3).asterix().startEffect.text('coffee', {size: Size.SMALL, uppercase: true});
            });
            ce.action('5 M€ (+1 per Starbucks there): open a Starbucks in a city next to coffee, one per adjacent coffee. +2 M€ production.', (eb) => {
              eb.megacredits(5, {text: '5+'}).startAction.city({size: Size.SMALL, all}).text('store', {size: Size.SMALL, uppercase: true}).production((pb) => pb.megacredits(2));
            });
          });
        }),
        victoryPoints: {...VP.cities(1, 1, true, true)},
      },
    });
  }

  public static readonly COFFEE_PRICE = 3;
  public static readonly STORE_PRICE = 5;

  /** Greeneries with coffee, and the number of Starbucks in each city. */
  public data: {coffee?: Array<SpaceId>, stores?: Partial<Record<SpaceId, number>>} = {};

  private stores(id: SpaceId): number {
    return this.data.stores?.[id] ?? 0;
  }

  private addCoffee(player: IPlayer, space: Space) {
    this.data.coffee = [...(this.data.coffee ?? []), space.id];
    player.game.log('${0} put coffee on ${1}', (b) => b.player(player).space(space));
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.tile === undefined || !GREENERY_TILES.has(space.tile.tileType)) {
      return;
    }
    if ((this.data.coffee ?? []).includes(space.id) || space.tile.upgrade !== undefined) {
      return;
    }
    const owner = space.player ?? activePlayer;
    if (owner === cardOwner) {
      this.addCoffee(cardOwner, space);
      return;
    }
    if (cardOwner.megaCredits < Starbucks.COFFEE_PRICE) {
      return;
    }
    cardOwner.defer(new OrOptions(
      new SelectOption(message('Pay ${0} 3 M€ to put coffee on ${1}', (b) => b.player(owner).space(space)), 'Pay').andThen(() => {
        cardOwner.stock.deduct(Resource.MEGACREDITS, Starbucks.COFFEE_PRICE, {log: true});
        owner.stock.add(Resource.MEGACREDITS, Starbucks.COFFEE_PRICE, {log: true, from: {card: this}});
        this.addCoffee(cardOwner, space);
        return undefined;
      }),
      new SelectOption('No coffee').andThen(() => undefined),
    ).setTitle('Starbucks: a greenery was placed'));
  }

  /** Cities on Mars next to more coffee greeneries than they have Starbucks. */
  private cities(player: IPlayer): Array<Space> {
    const board = player.game.board;
    const coffee = this.data.coffee ?? [];
    return board.spaces.filter((space) => {
      if (!Board.isCitySpace(space) || space.spaceType === SpaceType.COLONY) {
        return false;
      }
      const beans = board.getAdjacentSpaces(space).filter((s) => coffee.includes(s.id) && s.tile !== undefined).length;
      return beans > this.stores(space.id) && player.canAfford(Starbucks.STORE_PRICE + this.stores(space.id));
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.cities(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectSpace('Starbucks: select a city for a new Starbucks', this.cities(player)).andThen((space) => {
      const cost = Starbucks.STORE_PRICE + this.stores(space.id);
      player.game.defer(new SelectPaymentDeferred(player, cost, {title: 'Starbucks: pay for the store'}).andThen(() => {
        this.data.stores = {...(this.data.stores ?? {}), [space.id]: this.stores(space.id) + 1};
        player.production.add(Resource.MEGACREDITS, 2, {log: true});
        player.game.log('${0} opened a Starbucks in the city on ${1}', (b) => b.player(player).space(space));
      }));
      return undefined;
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    const board = player.game.board;
    return Object.entries(this.data.stores ?? {}).filter(([id, count]) => (count ?? 0) > 0 && Board.isCitySpace(board.getSpaceOrThrow(id as SpaceId))).length;
  }
}
