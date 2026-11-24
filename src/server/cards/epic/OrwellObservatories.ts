import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {all} from '../Options';
import {SelectCard} from '../../inputs/SelectCard';
import {TileType} from '../../../common/TileType';
import {SpaceId} from '../../../common/Types';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';

/** Ids for observatory cities: off-board spaces added during the game. */
const OBSERVATORY_IDS: ReadonlyArray<SpaceId> = ['c90', 'c91', 'c92', 'c93', 'c94', 'c95', 'c96', 'c97', 'c98', 'c99'];

export class OrwellObservatories extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.ORWELL_OBSERVATORIES,
      tags: [Tag.SPACE],
      startingMegaCredits: 41,
      initialActionText: 'Place an observatory city and draw a card',

      action: {},

      metadata: {
        cardNumber: 'EP-ORW',
        description: 'You start with 41 M€. First action: an observatory city (OC) and a card. No city project. OCs orbit by a free edge hex (gain its bonus). Rival tile by an OC: see 2 of their cards, take any -VP.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(41).tile(TileType.OBSERVATORY_CITY).asterix().cards(1);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tile(TileType.OBSERVATORY_CITY).startEffect.cards(1, {all}).text('-VP', {size: Size.SMALL});
            });
            ce.action('20 M€ (*titanium ok): OC, +2 M€ prod., card.', (eb) => {
              eb.megacredits(20).asterix().startAction.tile(TileType.OBSERVATORY_CITY).production((pb) => pb.megacredits(2)).cards(1);
            });
          });
        }),
      },
    });
  }

  /** The Mars hex each observatory city (by its space id) orbits next to. */
  public data: {anchors: Record<string, SpaceId>} = {anchors: {}};

  /** Free edge hexes of Mars that no observatory city orbits yet. */
  public freeEdgeSpaces(player: IPlayer): ReadonlyArray<Space> {
    const anchored = new Set(Object.values(this.data.anchors));
    return player.game.board.spaces.filter((space) =>
      space.edge && space.spaceType === SpaceType.LAND && space.tile === undefined && !anchored.has(space.id));
  }

  private nextId(player: IPlayer): SpaceId | undefined {
    return OBSERVATORY_IDS.find((id) => !player.game.board.spaces.some((s) => s.id === id));
  }

  private canPlace(player: IPlayer): boolean {
    return this.nextId(player) !== undefined && this.freeEdgeSpaces(player).length > 0;
  }

  /** Places an observatory city next to a free edge hex, collecting that hex's bonus. */
  public placeObservatory(player: IPlayer) {
    return new SelectSpace('Select the edge hex your observatory city orbits next to', this.freeEdgeSpaces(player)).andThen((anchor) => {
      const id = this.nextId(player);
      if (id === undefined) {
        return undefined;
      }
      const game = player.game;
      const space: Space = {id, spaceType: SpaceType.COLONY, x: -1, y: -1, bonus: [], edge: false};
      game.board.addOffBoardSpace(space);
      this.data.anchors[id] = anchor.id;
      game.addTile(player, space, {tileType: TileType.OBSERVATORY_CITY, card: this.name});
      game.grantSpaceBonusesAsPlacement(player, anchor);
      return undefined;
    });
  }

  public override initialAction(player: IPlayer) {
    player.drawCard();
    if (!this.canPlace(player)) {
      return undefined;
    }
    return this.placeObservatory(player);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.canPlace(player) && player.canAfford({cost: 20, titanium: true});
  }

  public override bespokeAction(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 20, {canUseTitanium: true, title: 'Orwell Observatories: pay for an observatory city'}).andThen(() => {
      player.production.add(Resource.MEGACREDITS, 2, {log: true});
      player.drawCard();
      player.defer(this.placeObservatory(player));
    }));
    return undefined;
  }

  /** A rival tile on or next to a hex an observatory city orbits: spy on their hand. */
  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner === activePlayer || boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) {
      return;
    }
    const board = cardOwner.game.board;
    const anchors = Object.values(this.data.anchors);
    const watched = anchors.includes(space.id) || board.getAdjacentSpaces(space).some((s) => anchors.includes(s.id));
    if (!watched || activePlayer.cardsInHand.length === 0) {
      return;
    }
    const hand = [...activePlayer.cardsInHand];
    const seen: Array<IProjectCard> = [];
    while (seen.length < 2 && hand.length > 0) {
      seen.push(hand.splice(cardOwner.game.rng.nextInt(hand.length), 1)[0]);
    }
    cardOwner.game.log('${0} looked at ${1} card(s) in ${2}\'s hand', (b) => b.player(cardOwner).number(seen.length).player(activePlayer));
    const negative = seen.filter((card) => typeof card.victoryPoints === 'number' && card.victoryPoints < 0);
    if (negative.length === 0) {
      return;
    }
    cardOwner.defer(new SelectCard('Orwell Observatories: take any negative-VP cards', 'Take', negative, {min: 0, max: negative.length}).andThen((taken) => {
      for (const card of taken) {
        const index = activePlayer.cardsInHand.indexOf(card);
        if (index >= 0) {
          activePlayer.cardsInHand.splice(index, 1);
          cardOwner.cardsInHand.push(card);
          cardOwner.game.log('${0} took ${1} from ${2}', (b) => b.player(cardOwner).card(card).player(activePlayer));
        }
      }
      return undefined;
    }));
  }
}
