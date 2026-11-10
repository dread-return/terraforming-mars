import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {setOxygenLevel, setTemperature, setVenusScaleLevel, maxOutOceans} from '../../TestingUtils';
import {GrantVenusAltTrackBonusDeferred} from '../../../src/server/venusNext/GrantVenusAltTrackBonusDeferred';
import {venusLevelAfterSteps, venusStepsBetween} from '../../../src/server/venusNext/venusScale';
import {BoardName} from '../../../src/common/boards/BoardName';
import {getGlobalParameterMaximums} from '../../../src/common/boards/GlobalParameterMaximums';
import {CardName} from '../../../src/common/cards/CardName';
import {GameOptions} from '../../../src/server/game/GameOptions';
import {cast} from '@/common/utils/utils';

describe('Venus Phase 2 Venus track', () => {
  let game: IGame;
  let player: TestPlayer;

  function vp2Game(options: Partial<GameOptions> = {}) {
    return testGame(2, {venusNextExtension: true, venusPhase2Expansion: true, ...options});
  }

  function resourceBonus() {
    let action = game.deferredActions.pop();
    while (action !== undefined && !(action instanceof GrantVenusAltTrackBonusDeferred)) {
      action = game.deferredActions.pop();
    }
    if (action === undefined) {
      return undefined;
    }
    const deferred = cast(action, GrantVenusAltTrackBonusDeferred);
    return {standardResourceCount: deferred.standardResourceCount, wildResource: deferred.wildResource};
  }

  beforeEach(() => {
    [game, player] = vp2Game();
  });

  it('runs to 48%', () => {
    expect(game.max.venus).eq(48);
    expect(getGlobalParameterMaximums(BoardName.THARSIS, true).venus).eq(48);
  });

  it('keeps the map maximums without Venus Phase 2', () => {
    const [plain] = testGame(2, {venusNextExtension: true});
    expect(plain.max.venus).eq(30);
    const [vp2WithoutVenus] = testGame(2, {venusPhase2Expansion: true});
    expect(vp2WithoutVenus.max.venus).eq(30);
  });

  it('overrides Amazonis Planitia', () => {
    const [amazonis] = vp2Game({boardName: BoardName.AMAZONIS_PLANITIA});
    expect(amazonis.max.venus).eq(48);
    expect(amazonis.max.oceans).eq(11);
    expect(amazonis.globalParameterTracks.venus.map((t) => t.value)).deep.eq([8, 22, 34]);
  });

  it('moves 2% per step past 30%', () => {
    expect(venusLevelAfterSteps(30, 1, 48)).eq(32);
    expect(venusStepsBetween(30, 48, 48)).eq(9);
    expect(venusStepsBetween(0, 48, 48)).eq(24);
    // Amazonis Planitia is unchanged.
    expect(venusLevelAfterSteps(30, 1, 33)).eq(31);

    setVenusScaleLevel(game, 30);
    expect(game.increaseVenusScaleLevel(player, 2)).eq(2);
    expect(game.getVenusScaleLevel()).eq(34);
  });

  it('stops at 48%', () => {
    setVenusScaleLevel(game, 46);
    expect(game.increaseVenusScaleLevel(player, 3)).eq(1);
    expect(game.getVenusScaleLevel()).eq(48);
    expect(game.increaseVenusScaleLevel(player, 1)).eq(0);
  });

  it('Reds can lower it past 30%', () => {
    setVenusScaleLevel(game, 40);
    game.increaseVenusScaleLevel(player, -1);
    expect(game.getVenusScaleLevel()).eq(38);
  });

  it('draws a card at 8% and 22%', () => {
    setVenusScaleLevel(game, 6);
    game.increaseVenusScaleLevel(player, 1);
    expect(player.cardsInHand).has.length(1);

    setVenusScaleLevel(game, 20);
    game.increaseVenusScaleLevel(player, 1);
    expect(player.cardsInHand).has.length(2);
  });

  it('no longer grants TR at 16%', () => {
    setVenusScaleLevel(game, 14);
    const tr = player.terraformRating;
    game.increaseVenusScaleLevel(player, 1);
    expect(player.terraformRating).eq(tr + 1);
  });

  it('grants 1 TR at 34%', () => {
    setVenusScaleLevel(game, 32);
    const tr = player.terraformRating;
    game.increaseVenusScaleLevel(player, 1);
    expect(player.terraformRating).eq(tr + 2);
    expect(resourceBonus()).is.undefined;
  });

  it('grants a standard resource from 36%', () => {
    setVenusScaleLevel(game, 34);
    game.increaseVenusScaleLevel(player, 1);
    expect(resourceBonus()).deep.eq({standardResourceCount: 1, wildResource: false});
  });

  it('counts only the steps past 34%', () => {
    setVenusScaleLevel(game, 32);
    game.increaseVenusScaleLevel(player, 3);
    expect(resourceBonus()).deep.eq({standardResourceCount: 2, wildResource: false});
  });

  it('grants a standard and a wild resource at 48%', () => {
    setVenusScaleLevel(game, 44);
    game.increaseVenusScaleLevel(player, 3);
    expect(game.getVenusScaleLevel()).eq(48);
    expect(resourceBonus()).deep.eq({standardResourceCount: 2, wildResource: true});
  });

  it('replaces the Alt. Venus board', () => {
    [game, player] = vp2Game({altVenusBoard: true});
    setVenusScaleLevel(game, 16);
    game.increaseVenusScaleLevel(player, 1);
    expect(resourceBonus()).is.undefined;

    setVenusScaleLevel(game, 30);
    game.increaseVenusScaleLevel(player, 1);
    expect(resourceBonus()).is.undefined;

    expect(game.standardProjects.map((c) => c.name)).includes(CardName.AIR_SCRAPPING_STANDARD_PROJECT);
    expect(game.standardProjects.map((c) => c.name)).does.not.include(CardName.AIR_SCRAPPING_STANDARD_PROJECT_VARIANT);
  });

  function maxMars(game: IGame) {
    setTemperature(game, game.max.temperature);
    setOxygenLevel(game, game.max.oxygen);
    maxOutOceans(player);
  }

  it('does not end the game by default', () => {
    maxMars(game);
    setVenusScaleLevel(game, 30);
    expect(game.marsIsTerraformed()).is.true;
  });

  it('must reach 48% with Mandatory Venus Terraforming', () => {
    [game, player] = vp2Game({requiresVenusTrackCompletion: true});
    maxMars(game);
    setVenusScaleLevel(game, 30);
    expect(game.marsIsTerraformed()).is.false;
    setVenusScaleLevel(game, 46);
    expect(game.marsIsTerraformed()).is.false;
    setVenusScaleLevel(game, 48);
    expect(game.marsIsTerraformed()).is.true;
  });
});
