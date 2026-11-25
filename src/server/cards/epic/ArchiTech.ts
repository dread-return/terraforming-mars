import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {all} from '../Options';
import {SpaceId} from '../../../common/Types';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';

export class ArchiTech extends CorporationCard {
  constructor() {
    super({
      name: CardName.ARCHI_TECH,
      tags: [Tag.BUILDING],
      startingMegaCredits: 40,
      initialActionText: 'Draw 2 building cards, place 2 markers',

      metadata: {
        cardNumber: 'EP-ART',
        description: 'You start with 40 M€. First action: reveal cards until 2 building cards; take those. Mark 2 free land areas.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).cards(2, {secondaryTag: Tag.BUILDING}).emptyTile('normal', {size: Size.SMALL}).emptyTile('normal', {size: Size.SMALL}).asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).asterix().startEffect.megacredits(0, {text: '½'});
            });
            ce.vSpace(Size.TINY);
            ce.effect('Only you may build on your marked areas, at half the cost (rounded down). An opponent building next to one gives you its placement bonus.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL, all}).asterix().startEffect.text('bonus', {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  /** The marked spaces, and the cost of the card or standard project being played this action. */
  public data: {marks?: Array<SpaceId>, lastCost?: number} = {};

  private static freeSpaces(player: IPlayer): ReadonlyArray<Space> {
    return player.game.board.getAvailableSpacesOnLand(player).filter((space) => space.tile === undefined && space.player === undefined);
  }

  public override initialAction(player: IPlayer) {
    player.drawCard(2, {tag: Tag.BUILDING});
    for (let i = 0; i < 2; i++) {
      player.game.defer(new SimpleDeferredAction(player, () => {
        const spaces = ArchiTech.freeSpaces(player);
        if (spaces.length === 0) {
          return undefined;
        }
        return new SelectSpace('Archi-Tech: select an area to mark', spaces).andThen((space) => {
          space.player = player;
          this.data.marks = [...(this.data.marks ?? []), space.id];
          player.game.log('${0} marked ${1}', (b) => b.player(player).space(space));
          return undefined;
        });
      }));
    }
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type !== CardType.CORPORATION) {
      this.data.lastCost = player.getCardCost(card as IProjectCard);
    }
    return undefined;
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    this.data.lastCost = project.getAdjustedCost(player);
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner !== activePlayer || !(this.data.marks ?? []).includes(space.id)) {
      return;
    }
    const refund = Math.floor((this.data.lastCost ?? 0) / 2);
    this.data.lastCost = 0;
    if (refund > 0) {
      cardOwner.stock.add(Resource.MEGACREDITS, refund, {log: true, from: {card: this}});
    }
  }
}
