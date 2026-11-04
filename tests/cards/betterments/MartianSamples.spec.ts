import {expect} from 'chai';
import {MartianSamples} from '../../../src/server/cards/betterments/MartianSamples';
import {testGame} from '../../TestGame';
import {runAllActions, setOxygenLevel} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '../../../src/common/utils/utils';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';

describe('MartianSamples', () => {
  it('requires 4% oxygen or less', () => {
    const card = new MartianSamples();
    const [game, player] = testGame(2);
    setOxygenLevel(game, 5);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 4);
    expect(card.canPlay(player)).is.true;
  });

  it('reserves 3 areas for you with a bonus resource', () => {
    const card = new MartianSamples();
    const [game, player, player2] = testGame(2);
    card.play(player);
    const claimed = [];
    for (let i = 0; i < 3; i++) {
      runAllActions(game);
      const selectSpace = cast(player.popWaitingFor(), SelectSpace);
      const space = selectSpace.spaces[0];
      selectSpace.cb(space);
      claimed.push(space);
    }
    for (const space of claimed) {
      expect(space.player).eq(player);
      expect(space.bonus).includes(SpaceBonus.STANDARD_RESOURCE);
      expect(game.board.getAvailableSpacesForCity(player2).map((s) => s.id)).does.not.include(space.id);
    }
  });
});
