import {expect} from 'chai';
import {RooftopGardens} from '../../../src/server/cards/betterments/RooftopGardens';
import {testGame} from '../../TestGame';
import {addCity, runAllActions, setOxygenLevel} from '../../TestingUtils';

describe('RooftopGardens', () => {
  it('requires 5% oxygen', () => {
    const card = new RooftopGardens();
    const [game, player] = testGame(2);
    setOxygenLevel(game, 4);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 5);
    expect(card.canPlay(player)).is.true;
  });

  it('gains 2 plants whenever any city is placed', () => {
    const card = new RooftopGardens();
    const [game, player, player2] = testGame(2);
    player.playedCards.push(card);
    addCity(player2);
    runAllActions(game);
    expect(player.plants).eq(2);
    addCity(player);
    runAllActions(game);
    expect(player.plants).eq(4);
  });
});
