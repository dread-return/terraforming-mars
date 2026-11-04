import {expect} from 'chai';
import {SeedSharing} from '../../../src/server/cards/betterments/SeedSharing';
import {testGame} from '../../TestGame';

describe('SeedSharing', () => {
  it('requires some player to have plant production', () => {
    const card = new SeedSharing();
    const [/* game */, player, player2] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player2.production.override({plants: 1});
    expect(card.canPlay(player)).is.true;
  });

  it('raises plant production and gives every player 2 plants', () => {
    const card = new SeedSharing();
    const [/* game */, player, player2] = testGame(2);
    card.play(player);
    expect(player.production.plants).eq(2);
    expect(player.plants).eq(2);
    expect(player2.plants).eq(2);
  });
});
