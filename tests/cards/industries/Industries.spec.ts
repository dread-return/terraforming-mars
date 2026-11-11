import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast, toName} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {Payment} from '../../../src/common/inputs/Payment';
import {CardName} from '../../../src/common/cards/CardName';
import {TileType} from '../../../src/common/TileType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {Resource} from '../../../src/common/Resource';
import {INDUSTRY_COST, INDUSTRY_STANDARD_PROJECT, INDUSTRY_KINDS, INDUSTRY_TILE, MAX_INDUSTRIES, IndustryKind} from '../../../src/common/industries/Industries';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectResource} from '../../../src/server/inputs/SelectResource';
import {Space} from '../../../src/server/boards/Space';
import {Industries} from '../../../src/server/industries/Industries';
import {IStandardProjectCard} from '../../../src/server/cards/IStandardProjectCard';
import {MoneyIndustryStandardProject, PlantIndustryStandardProject, RandomIndustryStandardProject, SteelIndustryStandardProject} from '../../../src/server/cards/industries/IndustryStandardProjects';
import {IndustryStandardProject} from '../../../src/server/cards/industries/IndustryStandardProject';
import {Tag} from '../../../src/common/cards/Tag';

function industryGame(): [IGame, TestPlayer, TestPlayer] {
  const [game, player, player2] = testGame(2, {industriesExpansion: true});
  return [game, player, player2];
}

function project(game: IGame, kind: IndustryKind): IStandardProjectCard {
  const card = game.standardProjects.find((c) => c.name === INDUSTRY_STANDARD_PROJECT[kind]);
  if (card === undefined) {
    throw new Error('missing ' + kind);
  }
  return card;
}

/** Places a finished industry tile for `player` on the first free land space, without paying. */
function giveIndustry(game: IGame, player: TestPlayer, kind: IndustryKind = 'money'): Space {
  const space = game.board.getAvailableSpacesOnLand(player)[0];
  game.simpleAddTile(player, space, {tileType: INDUSTRY_TILE[kind]});
  return space;
}

/** Plays an industry for `player` and answers the placement prompt with `space`. Returns the new tile's space. */
function buy(game: IGame, player: TestPlayer, card: IndustryStandardProject, space: Space): Space {
  player.megaCredits = 100;
  card.payAndExecute(player, Payment.of({megacredits: card.cost}));
  runAllActions(game);
  cast(player.popWaitingFor(), SelectSpace).cb(space);
  runAllActions(game);
  return space;
}

describe('Industries', () => {
  it('are offered only when the option is on', () => {
    const [game] = industryGame();
    const names = game.standardProjects.map(toName);
    for (const kind of INDUSTRY_KINDS) {
      expect(names).includes(INDUSTRY_STANDARD_PROJECT[kind]);
    }
    const [plain] = testGame(2);
    expect(plain.standardProjects.map(toName)).does.not.include(CardName.MONEY_INDUSTRY_STANDARD_PROJECT);
  });

  it('cost what the GIGA board prints', () => {
    const [game] = industryGame();
    const costs = INDUSTRY_KINDS.map((kind) => project(game, kind).cost);
    expect(costs).deep.eq([8, 8, 10, 10, 14, 14, 18]);
    expect(INDUSTRY_COST.random).eq(18);
  });

  it('need more power tags than industries owned', () => {
    const [game, player] = industryGame();
    player.megaCredits = 100;
    const card = project(game, 'money');
    expect(card.canAct(player)).is.false;

    player.tagsForTest = {[Tag.POWER]: 1};
    expect(card.canAct(player)).is.true;

    giveIndustry(game, player);
    expect(card.canAct(player)).is.false;

    player.tagsForTest = {[Tag.POWER]: 2};
    expect(card.canAct(player)).is.true;
  });

  it('are capped at 5 per player outside the GIGA board', () => {
    const [game, player] = industryGame();
    player.megaCredits = 100;
    player.tagsForTest = {[Tag.POWER]: 20};
    const card = project(game, 'money');
    expect(Industries.max(game)).eq(MAX_INDUSTRIES);
    for (let i = 0; i < MAX_INDUSTRIES - 1; i++) {
      giveIndustry(game, player);
    }
    expect(card.canAct(player)).is.true;
    giveIndustry(game, player);
    expect(Industries.owned(player)).eq(5);
    expect(card.canAct(player)).is.false;
  });

  it("only counts the player's own industries", () => {
    const [game, player, player2] = industryGame();
    giveIndustry(game, player2);
    giveIndustry(game, player2);
    expect(Industries.owned(player)).eq(0);
    expect(Industries.owned(player2)).eq(2);
  });

  it('raise production, and a placed industry is not a special tile', () => {
    const [game, player] = industryGame();
    const space = game.board.getAvailableSpacesOnLand(player)[0];
    buy(game, player, new SteelIndustryStandardProject(), space);
    expect(player.production.steel).eq(1);
    expect(space.tile?.tileType).eq(TileType.INDUSTRY_STEEL);
    expect(space.player).eq(player);
    expect(player.megaCredits).eq(90);
    expect(space.adjacency).is.undefined;
  });

  it('splits resources over two areas next to the tile', () => {
    const [game, player] = industryGame();
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => game.board.getAdjacentSpaces(s).length === 6)!;
    const adjacent = game.board.getAdjacentSpaces(space).filter((s) => s.tile === undefined);
    const baseBonus = adjacent.map((s) => s.bonus.length);

    buy(game, player, new MoneyIndustryStandardProject(), space);
    expect(player.production.megacredits).eq(1);

    const first = cast(player.popWaitingFor(), SelectSpace);
    expect(first.spaces.map((s) => s.id)).to.have.members(adjacent.map((s) => s.id));
    const amount = cast(first.cb(adjacent[0]), SelectAmount);
    expect(amount.min).eq(1);
    expect(amount.max).eq(3);

    const second = cast(amount.cb(3), SelectSpace);
    expect(second.spaces.map((s) => s.id)).does.not.include(adjacent[0].id);
    second.cb(adjacent[1]);

    expect(adjacent[0].bonus.length).eq(baseBonus[0] + 3);
    expect(adjacent[1].bonus.length).eq(baseBonus[1] + 1);
    expect(adjacent[0].bonus.filter((b) => b === SpaceBonus.MEGACREDITS)).has.length(3);
    expect(adjacent[1].bonus.filter((b) => b === SpaceBonus.MEGACREDITS)).has.length(1);
  });

  it('skip the amount question when there is only one way to split', () => {
    const [game, player] = industryGame();
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => game.board.getAdjacentSpaces(s).length === 6)!;
    const adjacent = game.board.getAdjacentSpaces(space);
    buy(game, player, new PlantIndustryStandardProject(), space);

    const second = cast(cast(player.popWaitingFor(), SelectSpace).cb(adjacent[0]), SelectSpace);
    second.cb(adjacent[1]);

    expect(adjacent[0].bonus.filter((b) => b === SpaceBonus.PLANT)).has.length(1);
    expect(adjacent[1].bonus.filter((b) => b === SpaceBonus.PLANT)).has.length(1);
    expect(player.production.plants).eq(1);
  });

  it("gives resources straight to the owner of a tile it's placed on", () => {
    const [game, player, player2] = industryGame();
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => game.board.getAdjacentSpaces(s).length === 6)!;
    const adjacent = game.board.getAdjacentSpaces(space);
    game.simpleAddTile(player2, adjacent[0], {tileType: TileType.GREENERY});
    adjacent[0].bonus = [];
    const ocean = adjacent[1];
    game.simpleAddTile(player, ocean, {tileType: TileType.OCEAN});

    buy(game, player, new SteelIndustryStandardProject(), space);
    const first = cast(player.popWaitingFor(), SelectSpace);
    // The ocean has no owner to collect anything, so it is not offered.
    expect(first.spaces.map((s) => s.id)).does.not.include(ocean.id);
    expect(first.spaces.map((s) => s.id)).includes(adjacent[0].id);

    const amount = cast(first.cb(adjacent[0]), SelectAmount);
    cast(amount.cb(2), SelectSpace).cb(adjacent[2]);
    runAllActions(game);

    expect(player2.steel).eq(2);
    expect(adjacent[0].bonus).is.empty;
    expect(adjacent[2].bonus.filter((b) => b === SpaceBonus.STEEL)).has.length(1);
  });

  it('give what is placed to whoever places a tile on the area next', () => {
    const [game, player, player2] = industryGame();
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => game.board.getAdjacentSpaces(s).length === 6)!;
    const adjacent = game.board.getAdjacentSpaces(space);
    adjacent[0].bonus = [];
    adjacent[1].bonus = [];
    buy(game, player, new SteelIndustryStandardProject(), space);
    const amount = cast(cast(player.popWaitingFor(), SelectSpace).cb(adjacent[0]), SelectAmount);
    cast(amount.cb(2), SelectSpace).cb(adjacent[1]);

    game.addGreenery(player2, adjacent[0], false);
    runAllActions(game);
    expect(player2.steel).eq(2);
  });

  it('random industry places a single resource and asks which production to raise', () => {
    const [game, player] = industryGame();
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => game.board.getAdjacentSpaces(s).length === 6)!;
    const adjacent = game.board.getAdjacentSpaces(space);
    adjacent[0].bonus = [];
    buy(game, player, new RandomIndustryStandardProject(), space);

    const production = cast(player.popWaitingFor(), SelectResource);
    production.process({type: 'resource', resource: Resource.TITANIUM});
    runAllActions(game);
    expect(player.production.titanium).eq(1);

    cast(player.popWaitingFor(), SelectSpace).cb(adjacent[0]);
    runAllActions(game);
    expect(adjacent[0].bonus).deep.eq([SpaceBonus.STANDARD_RESOURCE]);
    expect(player.popWaitingFor()).is.undefined;
  });

  it('draw a card at step 4 of the industry track', () => {
    const [game, player] = industryGame();
    for (let i = 0; i < 3; i++) {
      giveIndustry(game, player);
    }
    player.cardsInHand = [];
    const space = game.board.getAvailableSpacesOnLand(player)[0];
    buy(game, player, new MoneyIndustryStandardProject(), space);
    expect(player.cardsInHand).has.length(1);
  });

  it('do not draw a card at any other step', () => {
    const [game, player] = industryGame();
    giveIndustry(game, player);
    player.cardsInHand = [];
    const space = game.board.getAvailableSpacesOnLand(player)[0];
    buy(game, player, new MoneyIndustryStandardProject(), space);
    expect(player.cardsInHand).is.empty;
  });

  it('gain a prelude at step 9 of the industry track', () => {
    const [game, player] = testGame(2, {industriesExpansion: true, preludeExtension: true});
    for (let i = 0; i < 9; i++) {
      giveIndustry(game, player);
    }
    expect(Industries.owned(player)).eq(9);
    Industries.grantTrackBonus(player);
    runAllActions(game);
    expect(player.popWaitingFor()).is.not.undefined;
  });
});

describe('space bonuses used by industries', () => {
  it('grant M€', () => {
    const [game, player] = testGame(1);
    game.grantSpaceBonus(player, SpaceBonus.MEGACREDITS, 4);
    expect(player.megaCredits).eq(4);
  });

  it('ask for each stacked standard resource', () => {
    const [game, player] = testGame(1);
    game.grantSpaceBonus(player, SpaceBonus.STANDARD_RESOURCE, 2);
    runAllActions(game);
    const first = cast(player.popWaitingFor(), SelectResource);
    first.process({type: 'resource', resource: Resource.STEEL});
    runAllActions(game);
    const second = cast(player.popWaitingFor(), SelectResource);
    second.process({type: 'resource', resource: Resource.HEAT});
    expect(player.steel).eq(1);
    expect(player.heat).eq(1);
  });
});
