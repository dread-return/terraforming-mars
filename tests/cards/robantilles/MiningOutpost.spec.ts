import {expect} from 'chai';
import {MiningOutpost} from '../../../src/server/cards/robantilles/MiningOutpost';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

describe('MiningOutpost', () => {
  it('trades energy for titanium production and places a city', () => {
    const card = new MiningOutpost();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    selectSpace.cb(selectSpace.spaces[0]);
    expect(player.production.titanium).eq(1);
    expect(game.board.getCities(player)).has.length(1);
  });
});
