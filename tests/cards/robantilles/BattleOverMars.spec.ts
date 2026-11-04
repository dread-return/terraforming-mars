import {expect} from 'chai';
import {BattleOverMars} from '../../../src/server/cards/robantilles/BattleOverMars';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {RandomMAOptionType} from '../../../src/common/ma/RandomMAOptionType';

describe('BattleOverMars', () => {
  it('removes an unclaimed milestone', () => {
    const card = new BattleOverMars();
    const [game, player] = testGame(2);
    const before = game.milestones.length;
    const options = cast(card.play(player), OrOptions);
    options.options[0].cb();
    expect(game.milestones).has.length(before - 1);
  });

  it('replaces it in games with random milestones and awards', () => {
    const card = new BattleOverMars();
    const [game, player] = testGame(2, {randomMA: RandomMAOptionType.LIMITED});
    const before = game.awards.map((a) => a.name);
    const options = cast(card.play(player), OrOptions);
    const removeAward = options.options.length - 1;
    const replacement = cast(options.options[removeAward].cb(), OrOptions);
    replacement.options[0].cb();
    expect(game.awards).has.length(before.length);
    expect(game.awards.map((a) => a.name)).not.deep.eq(before);
  });
});
