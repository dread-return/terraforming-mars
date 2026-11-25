import {SelectResourceTypeDeferred} from '../../deferredActions/SelectResourceTypeDeferred';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {TileType} from '../../../common/TileType';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';

import {CardRenderItem} from '../render/CardRenderItem';
import {CardRenderItemType} from '../../../common/cards/render/CardRenderItemType';
export class SovietMars extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.SOVIET_MARS,
      startingMegaCredits: 20,
      resourceType: CardResource.COMMUNE,
      victoryPoints: 'special',
      initialActionText: 'Place a mining tile',

      action: {},

      metadata: {
        cardNumber: 'EP-SOV',
        description: 'You start with 20 M€. First action: a mining tile on a steel or titanium area, and +1 of that production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(20).tile(TileType.MINING_RIGHTS, true).asterix().production((pb) => pb.steel(1).slash().titanium(1)).br;
          b.effect('Each tile you own adds a commune here. Every card you play costs 1 M€ less per commune here (lasting). Your Mars tiles go next to yours if possible.', (eb) => {
            eb.emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.resource(CardResource.COMMUNE).colon().megacredits(-1);
          }).br;
          b.action('Lose 2 TR: move a commune to the gulag. Every card costs 4 M€ less per commune there (lasting, but never below 3 M€), and each is -2 VP.', (eb) => {
            eb.text('-2', {size: Size.MEDIUM}).tr(1, {size: Size.SMALL}).startAction.resource(CardResource.COMMUNE).arrow().gulag().colon().megacredits(-4);
          });
        }),
        victoryPoints: {item: new CardRenderItem(CardRenderItemType.GULAG), points: -2, target: 1},
      },
    });
  }

  /** Communes sent to the gulag. */
  public data: {gulag?: number} = {};

  public override initialAction(player: IPlayer) {
    const spaces = player.game.board.getAvailableSpacesOnLand(player).filter((space) => space.tile === undefined &&
      (space.bonus.includes(SpaceBonus.STEEL) || space.bonus.includes(SpaceBonus.TITANIUM)));
    if (spaces.length === 0) {
      return undefined;
    }
    return new SelectSpace('Soviet Mars: select an area with steel or titanium for the mining tile', spaces).andThen((space) => {
      const kinds: Array<Resource> = [];
      if (space.bonus.includes(SpaceBonus.STEEL)) {
        kinds.push(Resource.STEEL);
      }
      if (space.bonus.includes(SpaceBonus.TITANIUM)) {
        kinds.push(Resource.TITANIUM);
      }
      player.game.addTile(player, space, {tileType: TileType.MINING_RIGHTS});
      player.game.defer(new SelectResourceTypeDeferred(player, kinds, 'Select a resource to gain 1 unit of production'))
        .andThen((resource) => player.production.add(resource, 1, {log: true}));
      return undefined;
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner === activePlayer && space.player === cardOwner) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    const gulag = this.data.gulag ?? 0;
    const discount = this.resourceCount + 4 * gulag;
    // With anyone in the gulag, cards never cost less than 3 M€.
    return gulag > 0 ? Math.max(0, Math.min(discount, card.cost - 3)) : discount;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && player.terraformRating >= 2;
  }

  public override bespokeAction(player: IPlayer) {
    player.removeResourceFrom(this, 1);
    this.data.gulag = (this.data.gulag ?? 0) + 1;
    player.decreaseTerraformRating(2, {log: true});
    player.game.log('${0} sent a commune to the gulag', (b) => b.player(player));
    return undefined;
  }

  public override getVictoryPoints() {
    return -2 * (this.data.gulag ?? 0);
  }
}
