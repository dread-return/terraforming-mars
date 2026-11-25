import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {Space} from '../../../src/server/boards/Space';
import {Starbucks} from '../../../src/server/cards/epic/Starbucks';
import {RedRailNetwork} from '../../../src/server/cards/epic/RedRailNetwork';
import {Cupola} from '../../../src/server/cards/epic/Cupola';
import {Primal} from '../../../src/server/cards/epic/Primal';
import {DomesWilderness} from '../../../src/server/domesWilderness/DomesWilderness';
import {DeepWellHeating} from '../../../src/server/cards/base/DeepWellHeating';
import {GameSetup} from '../../../src/server/GameSetup';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

/** A free land space with 6 free land neighbours and no bonuses around. */
function openSpace(game: IGame, exclude: Array<Space> = []): Space {
  const board = game.board;
  return board.spaces.find((space) =>
    space.spaceType === SpaceType.LAND && space.tile === undefined && space.player === undefined && !exclude.includes(space) &&
    board.getAdjacentSpaces(space).length === 6 &&
    board.getAdjacentSpaces(space).every((s) => s.spaceType === SpaceType.LAND && s.tile === undefined && s.player === undefined && !exclude.includes(s)))!;
}

describe('Epic Corporations batch 18', () => {
  it('Starbucks: coffee on greeneries (paid on others\'), stores in cities next to coffee, VP per city', () => {
    const corp = new Starbucks();
    const [game, player, other] = withCorp(corp);
    const city = openSpace(game);
    const [g1, g2] = game.board.getAdjacentSpaces(city);
    game.addCity(other, city);
    game.addGreenery(player, g1);
    runAllActions(game);
    expect(corp.data.coffee).deep.eq([g1.id]);

    player.megaCredits = 30;
    other.megaCredits = 0;
    game.addGreenery(other, g2);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(player.megaCredits).eq(27);
    expect(other.megaCredits).eq(3);
    expect(corp.data.coffee).has.length(2);

    // Two coffee greeneries next to the city: two stores, the second costs 1 more.
    cast(corp.action(player), SelectSpace).cb(city);
    runAllActions(game);
    expect(player.megaCredits).eq(22);
    cast(corp.action(player), SelectSpace).cb(city);
    runAllActions(game);
    expect(player.megaCredits).eq(16);
    expect(player.production.megacredits).eq(4);
    expect(corp.canAct(player)).is.false;
    expect(corp.getVictoryPoints(player)).eq(1);
  });

  it('Red Rail Network: building cards add rail markers; a railway between 2 cities pays M€ production', () => {
    const corp = new RedRailNetwork();
    const [game, player, other] = withCorp(corp);
    expect(player.steel).eq(10);
    const board = game.board;
    // Two cities with two free spaces between them: a - r1 - r2 - b, with b not next to a or r1.
    const land = (x: Space) => x.spaceType === SpaceType.LAND && x.tile === undefined && x.player === undefined;
    let found: [Space, Space, Space, Space] | undefined;
    for (const a of board.spaces.filter(land)) {
      for (const r1 of board.getAdjacentSpaces(a).filter(land)) {
        for (const r2 of board.getAdjacentSpaces(r1).filter((x) => land(x) && x !== a && !board.getAdjacentSpaces(a).includes(x))) {
          const b = board.getAdjacentSpaces(r2).find((x) => land(x) && x !== r1 && !board.getAdjacentSpaces(r1).includes(x) && !board.getAdjacentSpaces(a).includes(x));
          if (b !== undefined && found === undefined) {
            found = [a, r1, r2, b];
          }
        }
      }
    }
    const [a, r1, r2, b] = found!;
    game.addCity(player, a);
    game.addCity(player, b);
    for (const space of [r1, r2]) {
      corp.onCardPlayed(player, new DeepWellHeating());
      runAllActions(game);
      const select = cast(player.popWaitingFor(), SelectSpace);
      expect(select.spaces).contains(space);
      select.cb(space);
    }
    expect(r1.player).eq(player);
    expect(corp.canAct(player)).is.true;
    const before = player.production.megacredits;
    corp.action(player);
    runAllActions(game);
    expect(player.production.megacredits).eq(before + 2);
    // With one opponent, the railway goes to them.
    expect(r1.player).eq(other);
    expect(r2.player).eq(other);
    expect(corp.data.given).has.length(2);
    expect(corp.canAct(player)).is.false;

    // Neutral ownership (solo) survives a reload.
    r1.player = GameSetup.neutralPlayerFor(game.id);
    const reloaded = GameSetup.deserializeBoard(game.players as Array<TestPlayer>, game.gameOptions, game.serialize());
    expect(reloaded.getSpaceOrThrow(r1.id).player?.id).eq(GameSetup.neutralPlayerFor(game.id).id);
  });

  it('Cupola: domes by anyone raise its M€ production 2; its action pays for a dome with titanium or energy production', () => {
    const corp = new Cupola();
    const [game, player, other] = withCorp(corp, {domesWilderness: true});
    expect(player.titanium).eq(2);
    const city = openSpace(game);
    game.addCity(other, city);
    DomesWilderness.upgrade(other, city, 'dome');
    expect(player.production.megacredits).eq(2);

    const mine = openSpace(game, [city, ...game.board.getAdjacentSpaces(city)]);
    game.addCity(player, mine);
    expect(corp.canAct(player)).is.false;
    player.titanium = 5;
    expect(corp.canAct(player)).is.true;
    cast(corp.action(player), SelectOption).cb(undefined);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(mine);
    expect(player.titanium).eq(0);
    expect(mine.tile?.upgrade).eq('dome');
    // Its own dome counts too.
    expect(player.production.megacredits).eq(2 + 1 + 2);
  });

  it('Primal: wilderness on another player\'s greenery (they keep it) and 5 M€ per wilderness', () => {
    const corp = new Primal();
    const [game, player, other] = withCorp(corp, {domesWilderness: true});
    const space = openSpace(game);
    game.addGreenery(other, space);
    expect(DomesWilderness.upgradeableGreeneries(player)).contains(space);
    const mc = player.megaCredits;
    DomesWilderness.upgrade(player, space, 'wilderness');
    runAllActions(game);
    expect(space.tile?.upgrade).eq('wilderness');
    expect(space.player).eq(other);
    expect(player.megaCredits).eq(mc + 5);
  });
});
