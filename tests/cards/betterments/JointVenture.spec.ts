import {expect} from 'chai';
import {JointVenture} from '../../../src/server/cards/betterments/JointVenture';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '../../../src/common/utils/utils';
import {Game} from '../../../src/server/Game';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';

describe('JointVenture', () => {
  it('needs an opponent with energy production', () => {
    const card = new JointVenture();
    const [/* game */, player, player2] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player2.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
  });

  it('places a city co-owned with the opponent', () => {
    const card = new JointVenture();
    const [game, player, player2] = testGame(2);
    player2.production.override({energy: 1});
    const selectPlayer = cast(card.play(player), SelectPlayer);
    selectPlayer.cb(player2);
    expect(player2.production.energy).eq(0);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    runAllActions(game);
    expect(space.player).eq(player);
    expect(space.coOwner).eq(player2);
    expect(game.board.getCities(player).map((s) => s.id)).includes(space.id);
    expect(game.board.getCities(player2).map((s) => s.id)).includes(space.id);
  });

  it('keeps the co-owner and incentive markers in a saved game', () => {
    const card = new JointVenture();
    const [game, player, player2] = testGame(2);
    player2.production.override({energy: 1});
    cast(card.play(player), SelectPlayer).cb(player2);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    runAllActions(game);
    const marked = game.board.getAvailableSpacesOnLand(player)[0];
    marked.bonus.push(SpaceBonus.INCENTIVE_5MC);

    const restored = Game.deserialize(game.serialize());
    const restoredSpace = restored.board.getSpaceOrThrow(space.id);
    expect(restoredSpace.coOwner?.id).eq(player2.id);
    expect(restored.board.getSpaceOrThrow(marked.id).bonus).includes(SpaceBonus.INCENTIVE_5MC);
  });
});
