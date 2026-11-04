import {expect} from 'chai';
import {CompanyIncentives} from '../../../src/server/cards/betterments/CompanyIncentives';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {cast} from '../../../src/common/utils/utils';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';

describe('CompanyIncentives', () => {
  it('marks 3 spaces that pay 5 M€ to whoever places a tile there', () => {
    const card = new CompanyIncentives();
    const [game, player, player2] = testGame(2);
    card.play(player);
    const marked = [];
    for (let i = 0; i < 3; i++) {
      runAllActions(game);
      const selectSpace = cast(player.popWaitingFor(), SelectSpace);
      const space = selectSpace.spaces[0];
      selectSpace.cb(space);
      marked.push(space);
    }
    runAllActions(game);
    expect(new Set(marked.map((s) => s.id)).size).eq(3);
    for (const space of marked) {
      expect(space.bonus).includes(SpaceBonus.INCENTIVE_5MC);
    }
    player2.megaCredits = 0;
    game.grantSpaceBonuses(player2, marked[0]);
    expect(player2.megaCredits).eq(5);
  });

  it('keeps the markers in a saved game', () => {
    const card = new CompanyIncentives();
    const [game, player] = testGame(2);
    card.play(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    const serialized = game.board.serialize();
    const saved = serialized.spaces.find((s) => s.id === space.id)!;
    expect(saved.bonus).includes(SpaceBonus.INCENTIVE_5MC);
  });
});
