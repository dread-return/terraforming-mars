import {expect} from 'chai';
import {JovianBeltMiningOperations} from '../../../src/server/cards/betterments/JovianBeltMiningOperations';
import {testGame} from '../../TestGame';

describe('JovianBeltMiningOperations', () => {
  it('raises titanium production for everyone', () => {
    const card = new JovianBeltMiningOperations();
    const [/* game */, player, player2, player3] = testGame(3);
    card.play(player);
    expect(player.production.titanium).eq(2);
    expect(player2.production.titanium).eq(1);
    expect(player3.production.titanium).eq(1);
  });
});
