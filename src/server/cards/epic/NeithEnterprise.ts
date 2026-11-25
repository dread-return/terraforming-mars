import {SpaceName} from '../../../common/boards/SpaceName';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';
import {SpaceId} from '../../../common/Types';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

export class NeithEnterprise extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.NEITH_ENTERPRISE,
      tags: [Tag.SPACE],
      startingMegaCredits: 43,
      initialActionText: 'Place a city on Neith HQ',

      action: {},

      metadata: {
        cardNumber: 'EP-NTH',
        description: 'You start with 43 M€. As your first action, place a city on the off-Mars area reserved for Neith HQ.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43).city().asterix();
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Any city placed off Mars: +1 M€ production.', (eb) => {
              eb.city({size: Size.SMALL, all}).asterix().startEffect.production((pb) => pb.megacredits(1));
            });
            ce.action('Pay 5 M€: look at X cards (X = empty city areas off Mars), keep 1.', (eb) => {
              eb.megacredits(5).startAction.text('X').cards(1).asterix();
            });
          });
        }),
      },
    });
  }

  public static readonly HQ: SpaceId = SpaceName.NEITH_HQ;
  public static readonly COST = 5;

  /** Adds the off-Mars Neith HQ area when the corporation is played. */
  public override bespokePlay(player: IPlayer) {
    const board = player.game.board;
    if (!board.spaces.some((s) => s.id === NeithEnterprise.HQ)) {
      board.addOffBoardSpace({id: NeithEnterprise.HQ, spaceType: SpaceType.COLONY, x: -1, y: -1, bonus: [], edge: false});
    }
    return undefined;
  }

  public override initialAction(player: IPlayer) {
    const space = player.game.board.getSpaceOrThrow(NeithEnterprise.HQ);
    if (space.tile === undefined) {
      player.game.addCity(player, space);
    }
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (space.spaceType === SpaceType.COLONY && Board.isCitySpace(space)) {
      cardOwner.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    }
  }

  /** Empty city areas outside Mars. */
  public static emptyAreas(player: IPlayer): number {
    return player.game.board.spaces.filter((s) => s.spaceType === SpaceType.COLONY && s.tile === undefined).length;
  }

  public override bespokeCanAct(player: IPlayer) {
    return NeithEnterprise.emptyAreas(player) > 0 && player.canAfford(NeithEnterprise.COST);
  }

  public override bespokeAction(player: IPlayer) {
    const count = NeithEnterprise.emptyAreas(player);
    player.game.defer(new SelectPaymentDeferred(player, NeithEnterprise.COST, {title: 'Neith Enterprise: pay 5 M€'}).andThen(() => {
      player.drawCardKeepSome(count, {keepMax: 1});
    }));
    return undefined;
  }
}
