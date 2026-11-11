import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {StandardProjectCanPayWith} from '../../../common/cards/Types';
import {Phase} from '../../../common/Phase';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {IColonyTrader} from '../../colonies/IColonyTrader';
import {IColony} from '../../colonies/IColony';
import {ColonyName} from '../../../common/colonies/ColonyName';
import {InputError} from '../../inputs/InputError';
import {message} from '../../logs/MessageBuilder';
import {IGame} from '../../IGame';
import {TileType} from '../../../common/TileType';

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
    // Eternal Space Walk: its owner's space-tag cards cost 2 M€ more.
    if (card.tags.includes(Tag.SPACE) && player.tableau.has(CardName.ETERNAL_SPACE_WALK)) {
      delta += 2;
    }
    // Sunset over Arsia Mons: assumes up to 6 discards at 2 M€ each (settled as it is played).
    if (card.name === CardName.SUNSET_OVER_ARSIA_MONS) {
      delta -= 2 * Math.max(0, Math.min(6, player.cardsInHand.length - 1));
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
    const heatValue = Eternity.standardProjectHeatValue(player);
    if (heatValue !== undefined) {
      result.heat = true;
      result.heatValue = heatValue;
    }
    if (player.tableau.has(CardName.MECHANIZED_WORLD_MAKER)) {
      result.steel = true;
    }
    if (player.tableau.has(CardName.ASTRAL_BOG)) {
      result.titanium = true;
    }
    if (project.name === CardName.CITY_STANDARD_PROJECT && player.tableau.has(CardName.GENERALIST_TERRAFORMA)) {
      result.steel = true;
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
    if (Eternity.blocksProjectCard(player, card)) {
      return true;
    }
    return card.tags.includes(Tag.CITY) && card.name !== CardName.EARTHS_LAST_CITY_REBUILT && player.tableau.has(CardName.EARTHS_LAST_CITY_REBUILT);
  }

  /** Interstella: ignore card effects that reduce your TR. */
  public static ignoresTrLoss(player: IPlayer): boolean {
    return player.tableau.has(CardName.INTERSTELLA_PROJECT);
  }

  /**
   * Cards that let a specific card ignore global requirements: Wingspears Corp (the action after a greenery),
   * Greeting Card and Tardigrade Parthenogenesis (the card they found, this generation).
   */
  public static ignoresGlobalRequirement(player: IPlayer, card: ICard): boolean {
    for (const c of player.tableau) {
      const f = (c as ICard & {ignoresGlobalRequirementsFor?: (p: IPlayer, c: ICard) => boolean}).ignoresGlobalRequirementsFor;
      if (f !== undefined && f.call(c, player, card)) {
        return true;
      }
    }
    return false;
  }

  /** Flora, Fauna, and Funga: its two cards play with global requirements +/- N steps (not oceans). */
  public static globalRequirementBonus(player: IPlayer, card: ICard, parameter: GlobalParameter): number {
    let bonus = 0;
    for (const c of player.tableau) {
      const f = (c as ICard & {globalRequirementBonusFor?: (p: IPlayer, c: ICard, g: GlobalParameter) => number}).globalRequirementBonusFor;
      if (f !== undefined) {
        bonus += f.call(c, player, card, parameter);
      }
    }
    return bonus;
  }

  /** Venusian Microfauna can't receive resources from other cards. */
  public static refusesResources(card: ICard): boolean {
    return card.name === CardName.VENUSIAN_MICROFAUNA;
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
    if (card.type === CardType.ACTIVE || card.type === CardType.AUTOMATED || card.type === CardType.EVENT) {
      player.projectCardsThisGeneration.push(card.name);
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

  /** DGT Mars Crew: passing only ends the turn while anyone else is still playing. */
  public static keepsPlayingAfterPass(player: IPlayer): boolean {
    const game = player.game;
    return game.phase === Phase.ACTION &&
      player.tableau.has(CardName.DGT_MARS_CREW) &&
      game.getPassedPlayers().length < game.players.length - 1;
  }

  /** Jovicorp: milestones need one unit less. */
  public static milestoneBonus(player: IPlayer): number {
    return player.tableau.has(CardName.JOVICORP) ? 1 : 0;
  }

  /** IOA: free trades with Io. */
  public static colonyTraders(player: IPlayer): Array<IColonyTrader> {
    if (!player.tableau.has(CardName.IOA)) {
      return [];
    }
    return [{
      canUse: () => player.game.colonies.some((c) => c.name === ColonyName.IO && c.isActive && c.visitor === undefined),
      optionText: () => message('Trade with Io for free (${0})', (b) => b.cardName(CardName.IOA)),
      trade: (colony: IColony) => {
        if (colony.name !== ColonyName.IO) {
          throw new InputError('The IOA free trade is only for Io');
        }
        player.game.log('${0} traded with ${1} for free', (b) => b.player(player).colony(colony));
        colony.trade(player);
      },
    }];
  }

  private static powerhouseBusy = false;
  /** Powerhouse: each energy or steel production increase may become the other. */
  public static onProductionIncrease(player: IPlayer, resource: Resource, amount: number): void {
    if (Eternity.powerhouseBusy || amount <= 0 || player.game === undefined) {
      return;
    }
    if (resource !== Resource.ENERGY && resource !== Resource.STEEL) {
      return;
    }
    if (!player.tableau.has(CardName.POWERHOUSE)) {
      return;
    }
    const phase = player.game.phase;
    if (phase !== Phase.ACTION && phase !== Phase.PRELUDES && phase !== Phase.CEOS) {
      return;
    }
    const other = resource === Resource.ENERGY ? Resource.STEEL : Resource.ENERGY;
    player.defer(new OrOptions(
      new SelectOption(message('Keep +${0} ${1} production', (b) => b.number(amount).string(resource))),
      new SelectOption(message('Make it +${0} ${1} production instead', (b) => b.number(amount).string(other))).andThen(() => {
        Eternity.powerhouseBusy = true;
        try {
          player.production.add(resource, -amount);
          player.production.add(other, amount, {log: true});
        } finally {
          Eternity.powerhouseBusy = false;
        }
        return undefined;
      })).setTitle('Powerhouse: energy or steel production?'));
  }

  /** Venusia: heat is worth 2 M€ for standard projects. */
  public static standardProjectHeatValue(player: IPlayer): number | undefined {
    return player.tableau.has(CardName.VENUSIA) ? 2 : undefined;
  }

  public static standardProjectHeatCredit(player: IPlayer, project: IStandardProjectCard): number {
    const value = Eternity.standardProjectHeatValue(player);
    if (value === undefined || project.name === CardName.SELL_PATENTS_STANDARD_PROJECT) {
      return 0;
    }
    // Helion-style heat is already counted at 1 M€ by canAfford.
    return player.heat * (player.canUseHeatAsMegaCredits ? value - 1 : value);
  }

  /** Generalist Terraforma keeps exactly 5 of its opening project cards, for free. */
  public static checkInitialCards(corporation: ICard, kept: number): void {
    if (corporation.name === CardName.GENERALIST_TERRAFORMA && kept !== 5) {
      throw new InputError('Generalist Terraforma must keep exactly 5 project cards');
    }
  }

  /** Administrative Restructure: 1 action per turn for everyone for the rest of the generation. */
  public static actionsPerTurn(game: IPlayer['game']): number {
    for (const p of game.players) {
      const card = p.playedCards.get(CardName.ADMINISTRATIVE_RESTRUCTURE);
      if (card !== undefined && (card.data as {gen?: number} | undefined)?.gen === game.generation) {
        return 1;
      }
    }
    return 2;
  }

  /** Eternal Space Walk: once played, its owner plays no other project card this generation. */
  public static blocksProjectCard(player: IPlayer, card: ICard): boolean {
    if (card.type !== CardType.ACTIVE && card.type !== CardType.AUTOMATED && card.type !== CardType.EVENT) {
      return false;
    }
    if (card.name === CardName.ETERNAL_SPACE_WALK) {
      return false;
    }
    return player.projectCardsThisGeneration.includes(CardName.ETERNAL_SPACE_WALK);
  }

  /** Big Cheats: generic hook for cards that waive tag requirements for a specific card. */
  public static ignoresTagRequirement(player: IPlayer, card: ICard): boolean {
    // Some unit tests use players without a game.
    if (player.game === undefined || !player.game.gameOptions.eternityExpansion) {
      return false;
    }
    for (const c of player.tableau) {
      const f = (c as ICard & {ignoresTagRequirementsFor?: (p: IPlayer, c: ICard) => boolean}).ignoresTagRequirementsFor;
      if (f !== undefined && f.call(c, player, card)) {
        return true;
      }
    }
    return false;
  }

  /** Big Cheats: called before a project card is played (before its requirements change). */
  public static beforeCardPlayed(player: IPlayer, card: ICard): void {
    if (!player.game.gameOptions.eternityExpansion) {
      return;
    }
    for (const c of player.tableau.asArray().slice()) {
      const f = (c as ICard & {beforeCardPlayedFor?: (p: IPlayer, c: ICard) => void}).beforeCardPlayedFor;
      f?.call(c, player, card);
    }
  }

  /** Price Manipulation Subsidies: this generation's production pays 2 M€ per non-M€ resource. */
  public static priceManipulationActive(game: IGame): boolean {
    if (!game.gameOptions.eternityExpansion) {
      return false;
    }
    return game.players.some((p) => {
      const card = p.playedCards.get(CardName.PRICE_MANIPULATION_SUBSIDIES);
      return card !== undefined && (card.data as {gen?: number} | undefined)?.gen === game.generation;
    });
  }

  /** Initiative Manipulator: the player who passed it last generation keeps the first player marker. */
  public static keptFirstPlayer(game: IGame): IPlayer | undefined {
    if (!game.gameOptions.eternityExpansion) {
      return undefined;
    }
    for (const p of game.players) {
      const card = p.playedCards.get(CardName.INITIATIVE_MANIPULATOR);
      const data = card?.data as {keepGen?: number, keeper?: string} | undefined;
      if (data?.keepGen === game.generation - 1 && data.keeper !== undefined) {
        return game.players.find((pl) => pl.id === data.keeper);
      }
    }
    return undefined;
  }

  /** Thawing Glacier: when temperature maxes out, each glacier becomes an ocean. */
  public static onTemperatureMaxed(game: IGame): void {
    if (!game.gameOptions.eternityExpansion) {
      return;
    }
    for (const space of game.board.spaces) {
      if (space.tile?.tileType !== TileType.GLACIER) {
        continue;
      }
      const owner = space.player ?? game.players.find((p) => p.tableau.has(CardName.THAWING_GLACIER));
      game.removeTile(space.id);
      if (owner === undefined) {
        continue;
      }
      owner.defer(() => {
        game.log('The Thawing Glacier melted', (b) => b);
        if (game.canAddOcean()) {
          game.addOcean(owner, space);
        } else {
          game.addTile(owner, space, {tileType: TileType.OCEAN});
        }
        owner.production.add(Resource.PLANTS, 2, {log: true});
        const animals = owner.getResourceCards(CardResource.ANIMAL);
        if (animals.length === 0) {
          return undefined;
        }
        return new SelectCard('Thawing Glacier: you may add 1 animal to a card', 'Add', animals, {min: 0, max: 1}).andThen(([card]) => {
          if (card !== undefined) {
            owner.addResourceTo(card, {qty: 1, log: true});
          }
          return undefined;
        });
      });
    }
  }

  /** Project Selection Device: whether `player` may draft an extra card this draft round. */
  public static canUseProjectSelectionDevice(player: IPlayer): boolean {
    return player.game.gameOptions.eternityExpansion === true && player.playedCards.has(CardName.PROJECT_SELECTION_DEVICE);
  }

  /** Project Selection Device: gain 3 M€ and put the device into the cards being passed on. */
  public static useProjectSelectionDevice(player: IPlayer): void {
    const card = player.playedCards.get(CardName.PROJECT_SELECTION_DEVICE);
    if (card === undefined) {
      return;
    }
    const game = player.game;
    player.playedCards.remove(card);
    card.data = {gen: game.generation, round: game.draftRound, by: player.id};
    player.draftHand.push(card as IProjectCard);
    player.stock.add(Resource.MEGACREDITS, 3, {log: true});
    game.log('${0} used ${1} to draft an extra card and passed it on', (b) => b.player(player).card(card));
  }

  /** Project Selection Device: its user skips the repick step of the round they used it in. */
  public static usedProjectSelectionDeviceThisRound(player: IPlayer): boolean {
    const game = player.game;
    return player.draftHand.some((c) => {
      const data = c.data as {gen?: number, round?: number, by?: string} | undefined;
      return c.name === CardName.PROJECT_SELECTION_DEVICE && data?.by === player.id && data.gen === game.generation && data.round === game.draftRound;
    });
  }
}
