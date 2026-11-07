import {IPlayer} from '../../IPlayer';
import {IGame} from '../../IGame';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {TileType} from '../../../common/TileType';
import {Resource} from '../../../common/Resource';
import {Payment} from '../../../common/inputs/Payment';
import {CONTAMINATION_MAX, CONTAMINATION_REWARDS} from '../../../common/nuclear/Contamination';
import {PlaceTile} from '../../deferredActions/PlaceTile';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {LoseAnyResource} from './LoseAnyResource';

/** The resources a red Nuclear special tile takes from whoever places a tile next to it. */
const RESOURCE_MALUS: Partial<Record<TileType, {plants?: number, microbes?: number, animals?: number}>> = {
  [TileType.EVACUATION_ZONE]: {plants: 1, microbes: 1},
  [TileType.RADIOACTIVE_DEFLUX]: {animals: 1},
};

/** Water Reservoir Analysis: which penalties each opponent has already paid this generation. */
export type WaterReservoirData = {used: Record<string, Array<'space' | 'building'>>};

/** Tags False Flag Operations can mark. Circled tags (space, science, building) apply to every player. */
export const FALSE_FLAG_TAGS = [Tag.SPACE, Tag.SCIENCE, Tag.BUILDING, Tag.JOVIAN, Tag.EARTH, Tag.POWER] as const;
export const FALSE_FLAG_CIRCLED_TAGS: ReadonlyArray<Tag> = [Tag.SPACE, Tag.SCIENCE, Tag.BUILDING];

/**
 * Engine hooks and helpers shared by the Nuclear (GIGA) cards, including the contamination track.
 */
export class Nuclear {
  // ---- Contamination track ------------------------------------------------

  public static isActive(game: IGame): boolean {
    return game.gameOptions.nuclearExpansion;
  }

  /** Radioactive tags printed on `card` (wild tags don't count). */
  public static radioactiveTags(card: ICard): number {
    return card.tags.filter((tag) => tag === Tag.RADIOACTIVE).length;
  }

  /** Called whenever `player` plays a card (project, prelude, corporation). */
  public static onCardPlayed(player: IPlayer, card: ICard): void {
    this.moveWasteBurialRadiation(player, card);
    if (!this.isActive(player.game)) {
      return;
    }
    const steps = this.radioactiveTags(card);
    if (steps > 0) {
      this.raiseContamination(player, steps);
    }
  }

  /** Moves the contamination marker up `steps` steps, giving `player` each step's reward. */
  public static raiseContamination(player: IPlayer, steps: number): void {
    const game = player.game;
    let raised = 0;
    for (let i = 0; i < steps && game.contamination < CONTAMINATION_MAX; i++) {
      game.contamination++;
      raised++;
      this.grantReward(player, game.contamination);
    }
    if (raised > 0) {
      game.log('${0} raised the contamination track ${1} step(s) to ${2}',
        (b) => b.player(player).number(raised).number(game.contamination));
    }
  }

  private static grantReward(player: IPlayer, step: number): void {
    const reward = CONTAMINATION_REWARDS[step];
    if (reward === undefined) {
      return;
    }
    if ('nuclearZone' in reward) {
      player.game.defer(new PlaceTile(player, {
        tile: {tileType: TileType.NUCLEAR_ZONE},
        on: 'land',
        title: 'Contamination track: select space for a Nuclear Zone',
      }));
    } else {
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: reward.radiation, log: true}));
    }
  }

  // ---- Red special tiles (adjacency malus) ---------------------------------

  /**
   * The extra M€ placing a tile next to `adjacentSpace` costs when it has no Ares adjacency data.
   * In Nuclear games every Nuclear Zone costs 2 M€ to place next to, like the Ares Nuclear Zone.
   */
  public static defaultAdjacencyCost(game: IGame, adjacentSpace: Space): number {
    if (this.isActive(game) && adjacentSpace.tile?.tileType === TileType.NUCLEAR_ZONE) {
      return 2;
    }
    return 0;
  }

  /** After `player` places a tile on `space`, take the resources adjacent red special tiles demand. */
  public static payResourceMalus(player: IPlayer, space: Space): void {
    const totals = {plants: 0, microbes: 0, animals: 0};
    for (const adjacent of player.game.board.getAdjacentSpaces(space)) {
      const tileType = adjacent.tile?.tileType;
      const malus = tileType === undefined ? undefined : RESOURCE_MALUS[tileType];
      if (malus !== undefined) {
        totals.plants += malus.plants ?? 0;
        totals.microbes += malus.microbes ?? 0;
        totals.animals += malus.animals ?? 0;
      }
    }
    if (totals.plants > 0) {
      const lost = Math.min(totals.plants, player.plants);
      if (lost > 0) {
        player.stock.deduct(Resource.PLANTS, lost, {log: true});
      }
    }
    if (totals.microbes > 0) {
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.MICROBE, totals.microbes,
        {source: 'self', blockable: false, title: 'Adjacency malus: select a card to remove microbes from'}));
    }
    if (totals.animals > 0) {
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, totals.animals,
        {source: 'self', blockable: false, title: 'Adjacency malus: select a card to remove animals from'}));
    }
  }

  // ---- Costs and payment ---------------------------------------------------

  /**
   * Cost changes coming from other players' cards (and False Flag's circled tags),
   * added to what `player` pays for `card`.
   */
  public static cardCostAdjustment(player: IPlayer, card: IProjectCard): number {
    let adjustment = 0;
    for (const other of player.game.players) {
      for (const played of other.tableau) {
        if (played.name === CardName.WATER_RESERVOIR_ANALYSIS && other !== player) {
          adjustment += this.waterReservoirPenalty(player, played, card);
        }
        if (played.name === CardName.FALSE_FLAG_OPERATIONS) {
          const tag = (played.data as {tag?: Tag} | undefined)?.tag;
          if (tag !== undefined && card.tags.includes(tag) &&
            (other !== player || FALSE_FLAG_CIRCLED_TAGS.includes(tag))) {
            adjustment += 1;
          }
        }
      }
    }
    return adjustment;
  }

  private static waterReservoirPenalty(player: IPlayer, waterReservoir: ICard, card: IProjectCard): number {
    if (waterReservoir.generationUsed !== player.game.generation) {
      return 0;
    }
    const used = (waterReservoir.data as WaterReservoirData | undefined)?.used ?? {};
    const usedByPlayer = used[player.id] ?? [];
    let penalty = 0;
    if (card.tags.includes(Tag.SPACE) && !usedByPlayer.includes('space')) {
      penalty += 5;
    }
    if (card.tags.includes(Tag.BUILDING) && !usedByPlayer.includes('building')) {
      penalty += 2;
    }
    return penalty;
  }

  /** Records that `player` paid Water Reservoir Analysis penalties for `card`. */
  public static onProjectCardPaid(player: IPlayer, card: IProjectCard, payment: Payment): void {
    for (const other of player.opponents) {
      const waterReservoir = other.playedCards.get(CardName.WATER_RESERVOIR_ANALYSIS);
      if (waterReservoir === undefined || waterReservoir.generationUsed !== player.game.generation) {
        continue;
      }
      const data = (waterReservoir.data as WaterReservoirData | undefined) ?? {used: {}};
      const used = data.used[player.id] ?? [];
      if (card.tags.includes(Tag.SPACE) && !used.includes('space')) {
        used.push('space');
      }
      if (card.tags.includes(Tag.BUILDING) && !used.includes('building')) {
        used.push('building');
      }
      data.used[player.id] = used;
      waterReservoir.data = data;
    }

    // Nuclear Classified Laboratory: a science card paid only with titanium adds a radiation.
    if (player.tableau.has(CardName.NUCLEAR_CLASSIFIED_LABORATORY) && card.tags.includes(Tag.SCIENCE) && !card.tags.includes(Tag.SPACE)) {
      const onlyTitanium = payment.titanium > 0 && Object.entries(payment).every(([key, value]) => key === 'titanium' || value === 0);
      if (onlyTitanium) {
        player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
      }
    }
  }

  /** Free Radicals: steel may pay for radioactive cards. */
  public static canUseSteel(player: IPlayer, card: IProjectCard): boolean {
    return card.tags.includes(Tag.RADIOACTIVE) && player.tableau.has(CardName.FREE_RADICALS);
  }

  /** Nuclear Classified Laboratory: titanium may pay for science cards. */
  public static canUseTitanium(player: IPlayer, card: IProjectCard): boolean {
    return card.tags.includes(Tag.SCIENCE) && player.tableau.has(CardName.NUCLEAR_CLASSIFIED_LABORATORY);
  }

  /** Radiation Shielding: with 5 or more radiation on it, steel is worth 1 M€ more. */
  public static steelValueBonus(player: IPlayer): number {
    const shielding = player.playedCards.get(CardName.RADIATION_SHIELDING);
    return (shielding?.resourceCount ?? 0) >= 5 ? 1 : 0;
  }

  // ---- Global parameters ---------------------------------------------------

  /**
   * Aerosol Isotopes: its owner adds a radiation when they raise oxygen; an opponent who raises
   * oxygen removes one resource of their choice (not M€).
   */
  public static onOxygenRaised(player: IPlayer, steps: number): void {
    if (steps <= 0) {
      return;
    }
    for (const owner of player.game.players) {
      if (!owner.playedCards.has(CardName.AEROSOL_ISOTOPES)) {
        continue;
      }
      if (owner === player) {
        player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: steps, log: true}));
      } else {
        for (let i = 0; i < steps; i++) {
          player.game.defer(new LoseAnyResource(player, CardName.AEROSOL_ISOTOPES));
        }
      }
    }
  }

  // ---- Radiation -----------------------------------------------------------

  /** Total radiation on `player`'s cards. */
  public static radiationCount(player: IPlayer): number {
    return player.getCardsWithResources(CardResource.RADIATION)
      .reduce((sum, card) => sum + (card.resourceCount ?? 0), 0);
  }

  /** Waste Burial (prelude): its 4 radiation move to the first radiation card played. */
  private static moveWasteBurialRadiation(player: IPlayer, card: ICard): void {
    if (card.resourceType !== CardResource.RADIATION) {
      return;
    }
    const wasteBurial = player.playedCards.get(CardName.WASTE_BURIAL);
    const waiting = (wasteBurial?.data as {waiting?: number} | undefined)?.waiting ?? 0;
    if (wasteBurial === undefined || waiting <= 0) {
      return;
    }
    wasteBurial.data = {waiting: 0};
    player.addResourceTo(card, {qty: waiting, log: true});
  }

  /** True for events. */
  public static isEvent(card: ICard): boolean {
    return card.type === CardType.EVENT;
  }
}
