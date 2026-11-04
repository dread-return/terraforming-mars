import {expect} from 'chai';
import {ExportsFromAmalthea} from '../../../src/server/cards/robantilles/ExportsFromAmalthea';
import {testGame} from '../../TestGame';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('ExportsFromAmalthea', () => {
  it('requires an off-world city', () => {
    const card = new ExportsFromAmalthea();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    game.addCity(player, game.board.spaces.find((s) => s.spaceType === SpaceType.COLONY)!);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(4);
  });
});
