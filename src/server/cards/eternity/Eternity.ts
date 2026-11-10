import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {StandardProjectCanPayWith} from '../../../common/cards/Types';

/**
 * Engine hooks for the Eternity fan expansion. Every hook is a no-op unless an Eternity card is in play,
 * so these are safe to call from core code.
 */
export class Eternity {
  /** Tharsis Prototype City: the next tile placed does not collect its space's placement bonus. */
  public static skipNextSpaceBonus = false;

  private static anyoneHas(player: IPlayer, name: CardName): Array<IPlayer> {
    return player.game.players.filter((p) => p.tableau.has(name));
  }

  /** Card cost changes from Astral Bog, Exoplanet Builders and Mars Conservationists (they hit every player). */
  public static cardCostAdjustment(player: IPlayer, card: IProjectCard): number {
    if (!player.game.gameOptions.eternityExpansion) {
      return 0;
    }
    let delta = 0;
    const tags = card.tags.length;
    delta += Eternity.anyoneHas(player, CardName.ASTRAL_BOG).length * tags;
    delta += Eternity.anyoneHas(player, CardName.EXOPLANET_BUILDERS).length * 2 * tags;
    if (card.tags.includes(Tag.CITY) || card.behavior?.city !== undefined) {
      delta += Eternity.anyoneHas(player, CardName.MARS_CONSERVATIONISTS).length * 3;
    }
    return delta;
  }

  public static standardProjectCostAdjustment(player: IPlayer, project: IStandardProjectCard): number {
    if (!player.game.gameOptions.eternityExpansion) {
      return 0;
    }
    if (project.name === CardName.CITY_STANDARD_PROJECT) {
      return Eternity.anyoneHas(player, CardName.MARS_CONSERVATIONISTS).length * 3;
    }
    return 0;
  }

  public static canUseSteel(player: IPlayer, card: IProjectCard): boolean {
    return card.tags.includes(Tag.PLANT) && player.tableau.has(CardName.BAMBOO_BUILDINGS);
  }

  public static canUseTitanium(player: IPlayer, card: IProjectCard): boolean {
    return card.tags.includes(Tag.SCIENCE) && player.tableau.has(CardName.SCIENCE_MISSION);
  }

  /** Extra payment options for standard projects. */
  public static standardProjectPayWith(player: IPlayer, project: IStandardProjectCard, base: StandardProjectCanPayWith): StandardProjectCanPayWith {
    const result = {...base};
    if (project.name === CardName.SELL_PATENTS_STANDARD_PROJECT) {
      return result;
    }
    if (player.tableau.has(CardName.MECHANIZED_WORLD_MAKER)) {
      result.steel = true;
    }
    if (player.tableau.has(CardName.ASTRAL_BOG)) {
      result.titanium = true;
    }
    if (project.name === CardName.CITY_STANDARD_PROJECT && player.tableau.has(CardName.STEEL_MONOPOLY)) {
      result.steel = true;
    }
    return result;
  }

  /** Resource Garrison: opponents may not steal or remove M€, steel or titanium. */
  public static isProtected(player: IPlayer, resource: Resource): boolean {
    return player.tableau.has(CardName.RESOURCE_GARRISON) &&
      (resource === Resource.MEGACREDITS || resource === Resource.STEEL || resource === Resource.TITANIUM);
  }

  /** Resource Garrison: opponents may not decrease steel, titanium or plant production. */
  public static productionProtected(player: IPlayer, resource: Resource, attacker: IPlayer): boolean {
    return attacker !== player && player.tableau.has(CardName.RESOURCE_GARRISON) &&
      (resource === Resource.STEEL || resource === Resource.TITANIUM || resource === Resource.PLANTS);
  }

  /** Earth's Last City Rebuilt: its owner may not play city-tag cards. */
  public static blocksCard(player: IPlayer, card: ICard): boolean {
    return card.tags.includes(Tag.CITY) && card.name !== CardName.EARTHS_LAST_CITY_REBUILT && player.tableau.has(CardName.EARTHS_LAST_CITY_REBUILT);
  }

  /** Interstella: ignore card effects that reduce your TR. */
  public static ignoresTrLoss(player: IPlayer): boolean {
    return player.tableau.has(CardName.INTERSTELLA_PROJECT);
  }

  /** Wingspears Corp: the action right after placing a greenery may ignore global requirements on an animal card. */
  public static ignoresGlobalRequirement(player: IPlayer, card: ICard): boolean {
    const wingspears = player.tableau.get(CardName.WINGSPEARS_CORP) as (ICard & {ignoresGlobalRequirementsFor?: (p: IPlayer, c: ICard) => boolean}) | undefined;
    return wingspears?.ignoresGlobalRequirementsFor?.(player, card) ?? false;
  }

  /** Patent Valuation Adjustment: +1 M€ per card sold. */
  public static sellPatentsBonus(player: IPlayer): number {
    return player.tableau.has(CardName.PATENT_VALUATION_ADJUSTMENT) ? 1 : 0;
  }

  /** Transaction Network: when ANY player discards a card from hand, add a floater. */
  public static onDiscardFromHand(player: IPlayer): void {
    for (const p of player.game.players) {
      const card = p.tableau.get(CardName.TRANSACTION_NETWORK);
      if (card !== undefined) {
        p.addResourceTo(card, {qty: 1, log: true});
      }
    }
  }

  /** Dolphins count temperature raises by any player (the active player's own Dolphins use the card hook). */
  public static onGlobalParameterIncrease(activePlayer: IPlayer, parameter: GlobalParameter, steps: number): void {
    if (parameter !== GlobalParameter.TEMPERATURE || steps <= 0) {
      return;
    }
    for (const p of activePlayer.game.players) {
      if (p === activePlayer) {
        continue;
      }
      const dolphins = p.tableau.get(CardName.DOLPHINS);
      if (dolphins !== undefined) {
        p.addResourceTo(dolphins, {qty: steps, log: true});
      }
    }
  }

  /** New Thorgate: gain 2 M€ each time ANY player increases energy production. */
  public static onProductionGain(player: IPlayer, resource: Resource, amount: number): void {
    if (resource !== Resource.ENERGY || amount <= 0 || player.game === undefined) {
      return;
    }
    for (const p of player.game.players) {
      if (p.tableau.has(CardName.NEW_THORGATE)) {
        p.stock.add(Resource.MEGACREDITS, 2, {log: true});
      }
    }
  }

  /** Exoplanet Builders' action: for the rest of the generation, all players gain 1 steel per tag they play. */
  public static onCardPlayed(player: IPlayer, card: ICard): void {
    if (!player.game.gameOptions.eternityExpansion) {
      return;
    }
    for (const p of player.game.players) {
      const exo = p.tableau.get(CardName.EXOPLANET_BUILDERS);
      if (exo?.generationUsed === player.game.generation) {
        const n = card.tags.length;
        if (n > 0) {
          player.stock.add(Resource.STEEL, n, {log: true});
        }
      }
    }
  }

  /** Martian Plant Fertilizer: +1 plant when you gain plants from a placement bonus or from another card. */
  public static onPlantsGained(player: IPlayer, source: ICard | 'placement'): void {
    if (source !== 'placement' && source.name === CardName.MARTIAN_PLANT_FERTILIZER) {
      return;
    }
    if (player.tableau.has(CardName.MARTIAN_PLANT_FERTILIZER)) {
      player.stock.add(Resource.PLANTS, 1, {log: true});
    }
  }

  /** Counts the cards a player has that hold a given resource (used by tests and helpers). */
  public static resourceCards(player: IPlayer, type: CardResource): number {
    return player.getResourceCards(type).length;
  }
}
