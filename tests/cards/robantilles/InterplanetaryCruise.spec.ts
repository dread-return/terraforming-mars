import {expect} from 'chai';
import {InterplanetaryCruise} from '../../../src/server/cards/robantilles/InterplanetaryCruise';
import {testGame} from '../../TestGame';

describe('InterplanetaryCruise', () => {
  it('requires TR 27', () => {
    const card = new InterplanetaryCruise();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.setTerraformRating(27);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.titanium).eq(2);
  });
});
