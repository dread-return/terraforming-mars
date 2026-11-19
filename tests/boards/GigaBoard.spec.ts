import {expect} from 'chai';
import {DEFAULT_GAME_OPTIONS} from '@/server/game/GameOptions';
import {GigaBoard} from '@/server/boards/GigaBoard';
import {SeededRandom} from '@/common/utils/Random';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceBonus} from '@/common/boards/SpaceBonus';
import {BoardName} from '@/common/boards/BoardName';
import {SpaceId} from '@/common/Types';
import {GIGA_NOCTIS_CITY, GIGA_POLAR_SPACES, GIGA_SPACES} from '@/common/boards/gigaMap';
import {testGame} from '../TestGame';
import {TestPlayer} from '@tests/TestPlayer';
import {IGame} from '@/server/IGame';
import {setOxygenLevel, setTemperature, setVenusScaleLevel, maxOutOceans, runAllActions, addOcean} from '@tests/TestingUtils';
import {cast} from '@/common/utils/utils';
import {TileType} from '@/common/TileType';
import {Algae} from '@/server/cards/base/Algae';
import {ArcticAlgae} from '@/server/cards/base/ArcticAlgae';
import {PolarExplorer} from '@/server/milestones/PolarExplorer';
import {chooseMilestonesAndAwards} from '@/server/ma/MilestoneAwardSelector';
import {Industries} from '@/server/industries/Industries';
import {SelectPaymentDeferred} from '@/server/deferredActions/SelectPaymentDeferred';
import {isVenusPhase2Track} from '@/server/venus2/VenusPhase2Expansion';

describe('GigaBoard', () => {
  const board = GigaBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(0));
  const mars = board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);
  const space = (n: number) => board.getSpaceOrThrow(String(n).padStart(2, '0') as SpaceId);

  it('has the 175 printed spaces, in rows of the printed sizes', () => {
    expect(mars).has.length(175);
    const rows = [12, 15, 16, 17, 18, 19, 18, 17, 16, 15, 12];
    rows.forEach((count, y) => expect(mars.filter((s) => s.y === y), `row ${y}`).has.length(count));
    expect(mars[0].id).eq('01');
    expect(mars[174].id).eq('175');
  });

  it('reserves 55 spaces for oceans, has 12 volcanic spaces and 7 polar spaces', () => {
    expect(board.getSpaces(SpaceType.OCEAN)).has.length(55);
    expect(board.volcanicSpaceIds).to.have.members(['45', '47', '59', '60', '62', '63', '64', '65', '77', '81', '82', '100']);
    expect(GIGA_POLAR_SPACES).to.have.members(['05', '06', '07', '08', '19', '20', '21']);
    expect(board.isPolarSpace(space(5))).is.true;
    expect(board.isPolarSpace(space(175))).is.false;
  });

  it('matches some printed spaces', () => {
    // Olympus Mons: three cards.
    expect(space(62).bonus).deep.eq([SpaceBonus.DRAW_CARD, SpaceBonus.DRAW_CARD, SpaceBonus.DRAW_CARD]);
    expect(space(62).volcanic).is.true;
    // Hellas: three cards on an ocean space.
    expect(space(144).spaceType).eq(SpaceType.OCEAN);
    expect(space(144).bonus).has.length(3);
    // Pay 5 M€ for an ocean.
    expect(space(169).bonus).deep.eq([SpaceBonus.OCEAN]);
    expect(board.noctisCitySpaceId).eq(GIGA_NOCTIS_CITY);
    expect(GIGA_NOCTIS_CITY).eq('101');
  });

  it('computes adjacency for brick-offset rows', () => {
    // Space 1 is the first hex of the (even) top row. Its neighbours are 2 to its right, and 14 and 15 below.
    expect(board.getAdjacentSpaces(space(1)).map((s) => s.id)).to.have.members(['02', '14', '15']);
    // Space 50 is in an odd row (row 3, column 3). Rows 2 and 4 hold its upper and lower neighbours.
    const s50 = space(50);
    expect(s50.y).eq(3);
    const ids = board.getAdjacentSpaces(s50).map((s) => s.id);
    expect(ids).to.have.members(['33', '34', '49', '51', '67', '68']);
    // Every neighbour relation is symmetric.
    for (const s of mars) {
      for (const adj of board.getAdjacentSpaces(s)) {
        expect(board.getAdjacentSpaces(adj).map((a) => a.id), `${s.id} - ${adj.id}`).includes(s.id);
      }
    }
  });

  it('marks the edge spaces', () => {
    expect(space(1).edge).is.true;
    expect(space(50).edge).is.false;
    expect(space(175).edge).is.true;
    expect(mars.filter((s) => s.edge).length).is.lessThan(60);
  });

  it('shuffles like the other maps, keeping the special spaces', () => {
    const shuffled = GigaBoard.newInstance({...DEFAULT_GAME_OPTIONS, shuffleMapOption: true}, new SeededRandom(3));
    const shuffledMars = shuffled.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);
    expect(shuffledMars.map((s) => [s.spaceType, s.bonus])).not.deep.eq(mars.map((s) => [s.spaceType, s.bonus]));
    // Same number of oceans, same bonuses overall.
    expect(shuffled.getSpaces(SpaceType.OCEAN)).has.length(55);
    const allBonuses = (spaces: ReadonlyArray<{bonus: ReadonlyArray<SpaceBonus>}>) => spaces.flatMap((s) => s.bonus).toSorted();
    expect(allBonuses(shuffledMars)).deep.eq(allBonuses(mars));
    // Volcanic, polar, Noctis City and the 5 M€ ocean space keep their place.
    for (const id of [...board.volcanicSpaceIds, ...GIGA_POLAR_SPACES, GIGA_NOCTIS_CITY, '169'] as Array<SpaceId>) {
      expect(shuffled.getSpaceOrThrow(id).spaceType, id).eq(board.getSpaceOrThrow(id).spaceType);
      expect(shuffled.getSpaceOrThrow(id).bonus, id).deep.eq(board.getSpaceOrThrow(id).bonus);
    }
    // Same geometry and adjacency.
    expect(shuffled.getAdjacentSpaces(shuffled.getSpaceOrThrow('50')).map((s) => s.id)).to.have.members(['33', '34', '49', '51', '67', '68']);
  });

  it('is not shuffled without the option', () => {
    const again = GigaBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(3));
    expect(again.spaces.map((s) => [s.id, s.spaceType, s.bonus])).deep.eq(board.spaces.map((s) => [s.id, s.spaceType, s.bonus]));
  });

  it('serializes and deserializes', () => {
    const [game] = testGame(2, {boardName: BoardName.GIGA});
    const restored = GigaBoard.newInstance(game.gameOptions, new SeededRandom(0));
    expect(game.board.serialize()).deep.eq(restored.serialize());
    const copy = new GigaBoard(game.board.spaces);
    expect(copy.getAdjacentSpaces(space(50)).map((s) => s.id)).to.have.members(['33', '34', '49', '51', '67', '68']);
  });

  it('every printed number matches its id', () => {
    GIGA_SPACES.forEach((s, idx) => expect(Number(s.id)).eq(idx + 1));
  });
});

describe('GIGA board rules', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(2, {boardName: BoardName.GIGA, venusNextExtension: true});
  });

  it('global parameters move in half-size steps', () => {
    expect(game.max).deep.include({temperature: 10, oxygen: 15, oceans: 21, venus: 30});

    game.increaseTemperature(player, 1);
    expect(game.getTemperature()).eq(-29);
    game.increaseTemperature(player, 3);
    expect(game.getTemperature()).eq(-26);

    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(0.5);
    game.increaseOxygenLevel(player, 2);
    expect(game.getOxygenLevel()).eq(1.5);

    game.increaseVenusScaleLevel(player, 3);
    expect(game.getVenusScaleLevel()).eq(3);

    expect(player.terraformRating).eq(20 + 4 + 3 + 3);
  });

  it('parameters stop at their maximums', () => {
    setTemperature(game, 9);
    game.increaseTemperature(player, 3);
    expect(game.getTemperature()).eq(10);

    setOxygenLevel(game, 14.5);
    game.increaseOxygenLevel(player, 2);
    expect(game.getOxygenLevel()).eq(15);

    setVenusScaleLevel(game, 29);
    expect(game.increaseVenusScaleLevel(player, 3)).eq(1);
    expect(game.getVenusScaleLevel()).eq(30);
  });

  it('track bonuses: heat production at -24 °C, a temperature step at 8% oxygen', () => {
    setTemperature(game, -25);
    game.increaseTemperature(player, 1);
    expect(player.production.heat).eq(1);

    setOxygenLevel(game, 7.5);
    setTemperature(game, -10);
    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(8);
    expect(game.getTemperature()).eq(-9);
  });

  it('track bonuses: a card at 8% Venus, TR at 16%, a colony at 24%', () => {
    setVenusScaleLevel(game, 7);
    const cards = player.cardsInHand.length;
    game.increaseVenusScaleLevel(player, 1);
    expect(player.cardsInHand).has.length(cards + 1);

    setVenusScaleLevel(game, 15);
    const tr = player.terraformRating;
    game.increaseVenusScaleLevel(player, 1);
    expect(player.terraformRating).eq(tr + 2);
  });

  it('does not use the Venus Phase 2 track', () => {
    expect(isVenusPhase2Track({...game.gameOptions, venusPhase2Expansion: true})).is.false;
    const [game2] = testGame(2, {boardName: BoardName.GIGA, venusNextExtension: true, venusPhase2Expansion: true});
    expect(game2.max.venus).eq(30);
  });

  it('doubles card ocean requirements', () => {
    // Algae needs 5 oceans: 10 on the GIGA board.
    const algae = new Algae();
    maxOutOceans(player, 9);
    expect(algae.canPlay(player)).is.false;
    maxOutOceans(player, 10);
    expect(algae.canPlay(player)).is.true;
  });

  it('a temperature requirement stays in degrees', () => {
    // Arctic Algae: -12 °C or colder.
    const arcticAlgae = new ArcticAlgae();
    setTemperature(game, -12);
    expect(arcticAlgae.canPlay(player)).is.true;
    setTemperature(game, -11);
    expect(arcticAlgae.canPlay(player)).is.false;
  });

  it('Polar Explorer counts the polar spaces', () => {
    const milestone = new PolarExplorer();
    for (const id of ['05', '06', '07'] as Array<SpaceId>) {
      game.simpleAddTile(player, game.board.getSpaceOrThrow(id), {tileType: TileType.GREENERY});
    }
    game.simpleAddTile(player, game.board.getSpaceOrThrow('175'), {tileType: TileType.GREENERY});
    expect(milestone.getScore(player)).eq(3);
  });

  it('draws 10 milestones and 10 awards', () => {
    const drawn = chooseMilestonesAndAwards({...game.gameOptions});
    expect(drawn.milestones).has.length(10);
    expect(drawn.awards).has.length(10);
    expect(game.milestones).has.length(10);
    expect(game.awards).has.length(10);
  });

  it('allows 7 claimed milestones and 7 funded awards, from 8 to 20 M€', () => {
    const costs = [];
    for (let i = 0; i < 7; i++) {
      expect(game.allAwardsFunded()).is.false;
      costs.push(game.getAwardFundingCost());
      game.fundedAwards.push({award: game.awards[i], player});
    }
    expect(costs).deep.eq([8, 10, 12, 14, 16, 18, 20]);
    expect(game.allAwardsFunded()).is.true;

    for (let i = 0; i < 7; i++) {
      expect(game.allMilestonesClaimed()).is.false;
      game.claimedMilestones.push({milestone: game.milestones[i], player: player2});
    }
    expect(game.allMilestonesClaimed()).is.true;
  });

  it('allows 13 industries', () => {
    expect(Industries.max(game)).eq(13);
  });

  it('the ocean bonus space costs 5 M€', () => {
    player.megaCredits = 10;
    game.addTile(player, game.board.getSpaceOrThrow('169'), {tileType: TileType.GREENERY});
    const payment = cast(game.deferredActions.peek(), SelectPaymentDeferred);
    expect(payment.amount).eq(5);
    runAllActions(game);
    expect(player.megaCredits).eq(5);
  });

  it('oceans can be placed', () => {
    const ocean = addOcean(player);
    expect(ocean.spaceType).eq(SpaceType.OCEAN);
  });
});
