import {expect} from 'chai';
import {HumpbackWhales} from '../../../src/server/cards/robantilles/HumpbackWhales';
import {testGame} from '../../TestGame';
import {maxOutOceans} from '../../TestingUtils';

describe('HumpbackWhales', () => {
  it('requires 8 oceans and is worth 3 VP', () => {
    const card = new HumpbackWhales();
    const [/* game */, player] = testGame(2);
    maxOutOceans(player, 7);
    expect(card.canPlay(player)).is.false;
    maxOutOceans(player, 8);
    expect(card.canPlay(player)).is.true;
    expect(card.getVictoryPoints(player)).eq(3);
  });
});
