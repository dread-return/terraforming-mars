import {expect} from 'chai';
import {MeteorShower} from '../../../src/server/cards/robantilles/MeteorShower';
import {testGame} from '../../TestGame';

describe('MeteorShower', () => {
  it('grants steel and titanium', () => {
    const card = new MeteorShower();
    const [/* game */, player] = testGame(2);
    card.play(player);
    expect(player.steel).eq(5);
    expect(player.titanium).eq(4);
  });
});
