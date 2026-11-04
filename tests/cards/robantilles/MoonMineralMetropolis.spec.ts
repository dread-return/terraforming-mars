import {expect} from 'chai';
import {MoonMineralMetropolis} from '../../../src/server/cards/robantilles/MoonMineralMetropolis';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {MoonExpansion} from '../../../src/server/moon/MoonExpansion';

describe('MoonMineralMetropolis', () => {
  it('raises steel production and places a habitat on the Moon', () => {
    const card = new MoonMineralMetropolis();
    const [game, player] = testGame(2, {moonExpansion: true});
    player.titanium = 1; // Moon habitats cost 1 titanium.
    card.play(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    selectSpace.cb(selectSpace.spaces[0]);
    expect(player.production.steel).eq(4);
    expect(MoonExpansion.moonData(game).habitatRate).eq(1);
  });
});
