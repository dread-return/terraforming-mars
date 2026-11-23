import {expect} from 'chai';
import {testGame} from '../TestGame';
import {generationsLeft, playerValue, relativeValue} from '../../src/server/bots/StateValue';
import {setOxygenLevel, setTemperature, maxOutOceans} from '../TestingUtils';

describe('StateValue', () => {
  it('more production is worth more, and more so early in the game', () => {
    const [game, player] = testGame(2);
    const before = playerValue(game, player);
    player.production.add('megacredits', 3);
    const early = playerValue(game, player) - before;
    expect(early).gt(0);

    setOxygenLevel(game, 12);
    setTemperature(game, 4);
    const [lateGame, latePlayer] = testGame(2);
    setOxygenLevel(lateGame, 12);
    setTemperature(lateGame, 4);
    maxOutOceans(latePlayer);
    const lateBefore = playerValue(lateGame, latePlayer);
    latePlayer.production.add('megacredits', 3);
    expect(playerValue(lateGame, latePlayer) - lateBefore).lt(early);
  });

  it('more M€ and more cards are worth more', () => {
    const [game, player] = testGame(2);
    const before = playerValue(game, player);
    player.megaCredits += 10;
    expect(playerValue(game, player)).eq(before + 10);
  });

  it('terraforming shortens the game', () => {
    const [game] = testGame(2);
    const start = generationsLeft(game);
    setOxygenLevel(game, 14);
    setTemperature(game, 8);
    expect(generationsLeft(game)).lt(start);
    expect(generationsLeft(game)).gte(1);
  });

  it('an opponent gaining counts against the player', () => {
    const [game, player, opponent] = testGame(2);
    const before = relativeValue(game, player);
    opponent.megaCredits += 20;
    expect(relativeValue(game, player)).lt(before);
  });
});
