import {expect} from 'chai';
import {AlienReactorActivation} from '../../../src/server/cards/robantilles/AlienReactorActivation';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';

describe('AlienReactorActivation', () => {
  it('raises temperature or oxygen and TR', () => {
    const card = new AlienReactorActivation();
    const [game, player] = testGame(2);
    player.playCard(card);
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[1].cb();
    runAllActions(game);
    expect(game.getOxygenLevel()).eq(1);
    expect(player.terraformRating).eq(22);
  });
});
