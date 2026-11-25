import {ICloneTagCard} from '../pathfinders/ICloneTagCard';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

import {GREENERY_TILES, OCEAN_TILES} from '../../../common/TileType';

export class DynamicBusinessServices extends ActiveCorporationCard implements ICloneTagCard {
  constructor() {
    super({
      name: CardName.DYNAMIC_BUSINESS_SERVICES,
      startingMegaCredits: 30,

      action: {},

      metadata: {
        cardNumber: 'EP-DBS',
        description: 'You start with 30 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).br;
          b.action('Pick one effect below for this generation; this card takes its tag.', (eb) => {
            eb.empty().startAction.tag(Tag.WILD).asterix();
          }).br;
          b.effect('Each plant tag you play: 1 plant.', (eb) => {
            eb.tag(Tag.PLANT).startEffect.plants(1);
          });
          b.effect('Trading costs 1 less.', (eb) => {
            eb.tag(Tag.SPACE).trade().startEffect.text('-1', {size: Size.MEDIUM});
          }).br;
          b.effect('Each tile you place (not greenery or ocean): 1 steel.', (eb) => {
            eb.tag(Tag.BUILDING).emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.steel(1);
          });
          b.effect('Each card you draw: 1 M€.', (eb) => {
            eb.tag(Tag.EARTH).cards(1).startEffect.megacredits(1);
          });
        }),
      },
    });
  }

  public static readonly CHOICES: ReadonlyArray<Tag> = [Tag.PLANT, Tag.SPACE, Tag.BUILDING, Tag.EARTH];

  /** The effect chosen this generation, shown as this card's tag (clone = blank). */
  public cloneTag: Tag = Tag.CLONE;
  public data: {generation?: number} = {};

  public override get tags(): Array<Tag> {
    return [this.cloneTag];
  }

  /** The active effect, if one was chosen this generation. */
  public active(player: IPlayer): Tag | undefined {
    return this.data.generation === player.game.generation && this.cloneTag !== Tag.CLONE ? this.cloneTag : undefined;
  }

  public override bespokeCanAct() {
    return true;
  }

  public override bespokeAction(player: IPlayer) {
    return new OrOptions(...DynamicBusinessServices.CHOICES.map((tag) => new SelectOption(tag, 'Activate').andThen(() => {
      this.setTag(player, tag);
      this.data.generation = player.game.generation;
      if (tag === Tag.SPACE) {
        player.colonies.tradeDiscount += 1;
      }
      player.game.log('${0} activated the ${1} effect of ${2}', (b) => b.player(player).string(tag).card(this));
      return undefined;
    }))).setTitle('Dynamic Business Services: activate an effect for this generation');
  }

  private setTag(player: IPlayer, tag: Tag) {
    player.playedCards.retagCard(this, () => this.cloneTag = tag);
  }

  /** A new generation: the chosen effect (and its tag) ends. */
  public resetForNewGeneration(player: IPlayer) {
    if (this.cloneTag === Tag.SPACE) {
      player.colonies.tradeDiscount = Math.max(0, player.colonies.tradeDiscount - 1);
    }
    if (this.cloneTag !== Tag.CLONE) {
      this.setTag(player, Tag.CLONE);
    }
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card !== this && this.active(player) === Tag.PLANT) {
      const plantTags = card.tags.filter((tag) => tag === Tag.PLANT).length;
      if (plantTags > 0) {
        player.stock.add(Resource.PLANTS, plantTags, {log: true, from: {card: this}});
      }
    }
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner !== activePlayer || this.active(cardOwner) !== Tag.BUILDING || space.tile === undefined) {
      return;
    }
    if (GREENERY_TILES.has(space.tile.tileType) || OCEAN_TILES.has(space.tile.tileType)) {
      return;
    }
    cardOwner.stock.add(Resource.STEEL, 1, {log: true, from: {card: this}});
  }
}
