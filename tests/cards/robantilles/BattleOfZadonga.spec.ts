import {expect} from 'chai';
import {BattleOfZadonga} from '../../../src/server/cards/robantilles/BattleOfZadonga';
import {testGame} from '../../TestGame';
import {addCity} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

describe('BattleOfZadonga', () => {
  it('co-owns an opponent\'s city', () => {
    const card = new BattleOfZadonga();
    const [game, player, player2] = testGame(2);
    expect(card.canPlay(player)).is.false;
    const city = addCity(player2);
    expect(card.canPlay(player)).is.true;
    cast(card.play(player), SelectSpace).cb(city);
    expect(city.coOwner).eq(player);
    expect(game.board.getCities(player)).has.length(1);
  });
});
