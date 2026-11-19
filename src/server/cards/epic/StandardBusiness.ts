import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectAmount} from '../../inputs/SelectAmount';
import {SelectStandardProjectToPlay} from '../../inputs/SelectStandardProjectToPlay';
import {PlaceCityTile} from '../../deferredActions/PlaceCityTile';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';
import {WildResourceCorporation} from './WildResourceCorporation';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';

export class StandardBusiness extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.STANDARD_BUSINESS,
      tags: [Tag.WILD],
      startingMegaCredits: 40,
      resourceType: CardResource.WILD_RESOURCE,
      initialActionText: 'Place a city, greenery or ocean tile',
      action: {},

      metadata: {
        cardNumber: 'EP-STB',
        description: 'You start with 40 M€ (+3 per other player). First action: place a city, greenery or ocean.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).megacredits(3, {text: '+3'}).slash().otherPlayer().emptyTile('normal', {size: Size.SMALL}).asterix();
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Place a tile: add a wild resource.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.resource(CardResource.WILD_RESOURCE).text('=').wild(1);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend X wild: a standard project for 3X M€ less.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.plate('Std. proj.').megacredits(-3, {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public data: {discount?: number} = {};

  protected override perOpponent() {
    return 3;
  }

  public override initialAction(player: IPlayer) {
    const board = player.game.board;
    const options: Array<SelectOption> = [];
    if (board.getAvailableSpacesForCity(player).length > 0) {
      options.push(new SelectOption('Place a city tile').andThen(() => {
        player.game.defer(new PlaceCityTile(player));
        return undefined;
      }));
    }
    if (board.getAvailableSpacesForGreenery(player).length > 0) {
      options.push(new SelectOption('Place a greenery tile').andThen(() => {
        player.game.defer(new PlaceGreeneryTile(player));
        return undefined;
      }));
    }
    if (player.game.canAddOcean()) {
      options.push(new SelectOption('Place an ocean tile').andThen(() => {
        player.game.defer(new PlaceOceanTile(player));
        return undefined;
      }));
    }
    if (options.length === 0) {
      return undefined;
    }
    return new OrOptions(...options).setTitle('Standard Business: place a tile');
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer) {
    if (cardOwner === activePlayer) {
      this.addWild(cardOwner);
    }
  }

  public getStandardProjectDiscount(_player: IPlayer, _card: IStandardProjectCard): number {
    return this.data.discount ?? 0;
  }

  private actable(player: IPlayer, wild: number): Array<IStandardProjectCard> {
    const previous = this.data.discount;
    this.data.discount = 3 * wild;
    try {
      return player.game.standardProjects.filter((sp) => sp.name !== CardName.SELL_PATENTS_STANDARD_PROJECT && sp.canAct(player));
    } finally {
      this.data.discount = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && this.actable(player, this.resourceCount).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    let min = 1;
    while (min < this.resourceCount && this.actable(player, min).length === 0) {
      min++;
    }
    const use = (x: number) => {
      const projects = this.actable(player, x);
      player.removeResourceFrom(this, x, {log: true});
      this.data.discount = 3 * x;
      return new SelectStandardProjectToPlay(player, projects, {
        title: `Standard Business: select a standard project (${3 * x} M€ less)`,
        buttonLabel: 'Confirm',
      });
    };
    if (min === this.resourceCount) {
      return use(min);
    }
    return new SelectAmount('Spend how many wild resources (3 M€ off each)?', 'Spend', min, this.resourceCount, true).andThen(use);
  }

  public onStandardProject() {
    this.data.discount = undefined;
  }
}
