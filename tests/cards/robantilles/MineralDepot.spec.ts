import {expect} from 'chai';
import {MineralDepot} from '../../../src/server/cards/robantilles/MineralDepot';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {AndOptions} from '../../../src/server/inputs/AndOptions';

describe('MineralDepot', () => {
  it('sells steel and titanium', () => {
    const card = new MineralDepot();
    const [/* game */, player] = testGame(2);
    player.steel = 3;
    player.titanium = 2;
    const options = cast(card.play(player), OrOptions);
    const sell = cast(options.options[0], AndOptions);
    sell.options[0].cb(2);
    sell.options[1].cb(1);
    sell.cb(undefined);
    expect(player.steel).eq(1);
    expect(player.titanium).eq(1);
    expect(player.megaCredits).eq(7);
  });

  it('buys steel and titanium', () => {
    const card = new MineralDepot();
    const [/* game */, player] = testGame(2);
    player.megaCredits = 10;
    const options = cast(card.play(player), OrOptions);
    const buy = cast(options.options[1], AndOptions);
    buy.options[0].cb(2);
    buy.options[1].cb(2);
    buy.cb(undefined);
    expect(player.megaCredits).eq(0);
    expect(player.steel).eq(2);
    expect(player.titanium).eq(2);
  });
});
