import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {Tag} from '../../../src/common/cards/Tag';
import {Resource} from '../../../src/common/Resource';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {Payment} from '../../../src/common/inputs/Payment';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Space} from '../../../src/server/boards/Space';
import {ArchiTech} from '../../../src/server/cards/epic/ArchiTech';
import {KaguyaTechEpic} from '../../../src/server/cards/epic/KaguyaTechEpic';
import {Tholus} from '../../../src/server/cards/epic/Tholus';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {Research} from '../../../src/server/cards/base/Research';
import {Algae} from '../../../src/server/cards/base/Algae';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

/** A free land space whose neighbours are all free land spaces without bonuses. */
function openSpace(game: IGame, exclude: Array<Space> = []): Space {
  const board = game.board;
  return board.spaces.find((space) =>
    space.spaceType === SpaceType.LAND && space.tile === undefined && space.player === undefined && !exclude.includes(space) &&
    board.getAdjacentSpaces(space).length === 6 &&
    board.getAdjacentSpaces(space).every((s) => s.spaceType === SpaceType.LAND && s.tile === undefined && s.player === undefined && !exclude.includes(s)))!;
}

describe('Epic Corporations batch 14', () => {
  it('Archi-Tech: first action draws 2 building cards and marks 2 areas', () => {
    const corp = new ArchiTech();
    const [game, player] = withCorp(corp);
    corp.initialAction(player);
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(player.cardsInHand.every((card) => card.tags.includes(Tag.BUILDING))).is.true;
    for (let i = 0; i < 2; i++) {
      const select = cast(player.popWaitingFor(), SelectSpace);
      select.cb(select.spaces[i]);
      runAllActions(game);
    }
    expect(corp.data.marks).has.length(2);
    const marked = game.board.getSpaceOrThrow(corp.data.marks![0]);
    expect(marked.player).eq(player);
  });

  it('Archi-Tech: building on a marked area refunds half; opponents next to it lose the bonus to it', () => {
    const corp = new ArchiTech();
    const [game, player, other] = withCorp(corp);
    const marked = openSpace(game);
    marked.player = player;
    corp.data.marks = [marked.id];

    // City standard project (25 M€) on the marked area: 12 M€ back.
    player.megaCredits = 25;
    const project = new CityStandardProject();
    project.payAndExecute(player, Payment.of({megacredits: 25}));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    expect(select.spaces).contains(marked);
    select.cb(marked);
    runAllActions(game);
    expect(player.megaCredits).eq(12);

    // An opponent places next to the marked area on a steel bonus: Archi-Tech gets the steel.
    const neighbour = game.board.getAdjacentSpaces(marked).find((s) => s.tile === undefined)!;
    neighbour.bonus = [SpaceBonus.STEEL, SpaceBonus.STEEL];
    game.addGreenery(other, neighbour);
    runAllActions(game);
    expect(player.steel).eq(2);
    expect(other.steel).eq(0);
  });

  it('Kaguya Tech (Epic): discard a science card to turn a greenery into a city', () => {
    const corp = new KaguyaTechEpic();
    const [game, player] = withCorp(corp);
    expect(player.production.energy).eq(1);
    expect(player.production.plants).eq(1);
    expect(corp.canAct(player)).is.false;

    const space = openSpace(game);
    game.addGreenery(player, space);
    runAllActions(game);
    player.cardsInHand.push(new Algae());
    expect(corp.canAct(player)).is.false;
    player.cardsInHand.push(new Research());
    expect(corp.canAct(player)).is.true;

    const oxygen = game.getOxygenLevel();
    const handSize = player.cardsInHand.length;
    const select = cast(corp.action(player), SelectCard);
    expect(select.cards.map((c) => c.name)).deep.eq([new Research().name]);
    select.cb([select.cards[0]]);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(space);
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.CITY);
    expect(space.player).eq(player);
    expect(player.production.megacredits).eq(2);
    expect(player.cardsInHand).has.length(handSize);
    expect(game.getOxygenLevel()).eq(oxygen);
  });

  it('Tholus: frames follow steel production; metropolis and megalopolis score extra', () => {
    const corp = new Tholus();
    const [game, player] = withCorp(corp);
    expect(player.production.steel).eq(1);
    expect(corp.resourceCount).eq(1);
    player.production.add(Resource.STEEL, 3);
    expect(corp.resourceCount).eq(4);
    player.production.add(Resource.STEEL, -1);
    expect(corp.resourceCount).eq(3);
    player.production.add(Resource.STEEL, 3);
    expect(corp.resourceCount).eq(6);

    const city = openSpace(game);
    game.addCity(player, city);
    const greeneries = game.board.getAdjacentSpaces(city).slice(0, 2);
    greeneries.forEach((s) => game.addGreenery(player, s));
    runAllActions(game);
    expect(corp.getVictoryPoints(player)).eq(0);

    player.megaCredits = 40;
    expect(corp.canAct(player)).is.true;
    cast(corp.action(player), SelectSpace).cb(city);
    runAllActions(game);
    expect(player.megaCredits).eq(30);
    expect(corp.resourceCount).eq(4);
    expect(city.tile?.tileType).eq(TileType.THOLUS_METROPOLIS);
    expect(game.board.getCities(player)).contains(city);
    expect(corp.getVictoryPoints(player)).eq(2);

    // The only city is now a metropolis, so only the megalopolis upgrade is offered.
    cast(corp.action(player), SelectSpace).cb(city);
    runAllActions(game);
    expect(player.megaCredits).eq(15);
    expect(corp.resourceCount).eq(1);
    expect(city.tile?.tileType).eq(TileType.THOLUS_MEGALOPOLIS);
    expect(game.board.getCities(player)).contains(city);
    expect(corp.getVictoryPoints(player)).eq(4);
  });
});
