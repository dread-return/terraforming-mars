import {expect} from 'chai';
import {testGame} from '../TestGame';
import {runAllActions} from '../TestingUtils';
import {Phase} from '../../src/common/Phase';
import {ClaimSpacesDeferred} from '../../src/server/underworld/ClaimSpacesDeferred';
import {SelectSpace} from '../../src/server/inputs/SelectSpace';
import {cast} from '../../src/common/utils/utils';

describe('ClaimSpacesDeferred', () => {
  it('offers identified spaces', () => {
    const [game, player] = testGame(2, {underworldExpansion: true});
    game.phase = Phase.ACTION;
    const [space] = game.board.getAvailableSpacesOnLand(player);
    space.undergroundResources = 'nothing';

    game.defer(new ClaimSpacesDeferred(player, 1, [space]));
    runAllActions(game);

    expect(cast(player.popWaitingFor(), SelectSpace).spaces).deep.eq([space]);
  });

  it('does not offer a never-identified space once the token bag is empty', () => {
    const [game, player] = testGame(2, {underworldExpansion: true});
    game.phase = Phase.ACTION;
    const [space] = game.board.getAvailableSpacesOnLand(player);
    game.underworldData.tokens.length = 0;

    game.defer(new ClaimSpacesDeferred(player, 1, [space]));
    runAllActions(game);

    expect(player.popWaitingFor()).is.undefined;
  });
});
