import {expect} from 'chai';
import {MassUrbanization} from '../../../src/server/cards/betterments/MassUrbanization';
import {testGame} from '../../TestGame';
import {addCity, runAllActions} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '../../../src/common/utils/utils';
import {Board} from '../../../src/server/boards/Board';

describe('MassUrbanization', () => {
  it('requires 3 cities on Mars and places 3 cities', () => {
    const card = new MassUrbanization();
    const [game, player] = testGame(2);
    addCity(player);
    addCity(player);
    expect(card.canPlay(player)).is.false;
    addCity(player);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    for (let i = 0; i < 3; i++) {
      runAllActions(game);
      const selectSpace = cast(player.popWaitingFor(), SelectSpace);
      selectSpace.cb(selectSpace.spaces[0]);
    }
    expect(game.board.spaces.filter((s) => s.player === player && Board.isCitySpace(s))).has.length(6);
  });
});
