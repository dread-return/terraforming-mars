import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {isIProjectCard} from '../IProjectCard';
import {isSpecialTile} from '../../boards/Board';

const TILE_PROJECTS = [CardName.CITY_STANDARD_PROJECT, CardName.GREENERY_STANDARD_PROJECT, CardName.AQUIFER_STANDARD_PROJECT];

export class HardHatConstruction extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HARD_HAT_CONSTRUCTION,
      tags: [Tag.BUILDING],
      startingMegaCredits: 38,
      resourceType: CardResource.WORKER,
      victoryPoints: {resourcesHere: {}},

      metadata: {
        cardNumber: 'EP-HHC',
        description: 'You start with 38 M€. 1 VP per worker here.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(38);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.TINY);
            ce.effect(undefined, (eb) => {
              eb.specialTile({size: Size.SMALL}).slash().emptyTile('normal', {size: Size.SMALL}).text('no bonus', {size: Size.SMALL}).startEffect.resource(CardResource.WORKER);
            });
            ce.vSpace(Size.TINY);
            ce.effect('Special tile, or a tile on a space with no bonus: +1 worker. Cards and projects placing tiles use workers for -10 M€ each.', (eb) => {
              eb.resource(CardResource.WORKER).startEffect.megacredits(-10);
            });
          });
        }),
      },
    });
  }

  private static placesTiles(card: IProjectCard): boolean {
    const b = card.behavior;
    return card.tilesBuilt.length > 0 || b?.city !== undefined || b?.greenery !== undefined || b?.ocean !== undefined;
  }

  private workersFor(cost: number): number {
    return Math.min(this.resourceCount, Math.ceil(cost / 10));
  }

  public override getCardDiscount(_player: IPlayer, card: IProjectCard) {
    return HardHatConstruction.placesTiles(card) ? 10 * this.workersFor(card.cost) : 0;
  }

  public getStandardProjectDiscount(_player: IPlayer, project: IStandardProjectCard) {
    return TILE_PROJECTS.includes(project.name) ? 10 * this.workersFor(project.cost) : 0;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card !== this && isIProjectCard(card) && HardHatConstruction.placesTiles(card)) {
      const used = this.workersFor(card.cost);
      if (used > 0) {
        player.removeResourceFrom(this, used, {log: true});
      }
    }
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (TILE_PROJECTS.includes(project.name)) {
      const used = this.workersFor(project.cost);
      if (used > 0) {
        player.removeResourceFrom(this, used, {log: true});
      }
    }
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) {
      return;
    }
    let workers = 0;
    if (isSpecialTile(space.tile?.tileType)) {
      workers++;
    }
    if (space.bonus.length === 0) {
      workers++;
    }
    if (workers > 0) {
      cardOwner.addResourceTo(this, {qty: workers, log: true});
    }
  }
}
