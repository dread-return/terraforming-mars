import {expect} from 'chai';
import {MonopolyBreakup} from '../../../src/server/cards/betterments/MonopolyBreakup';
import {testGame} from '../../TestGame';
import {addCity} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('MonopolyBreakup', () => {
  it('needs an opponent 10 TR ahead and a milestone you qualify for', () => {
    const card = new MonopolyBreakup();
    const [game, player, player2] = testGame(2);
    addCity(player);
    addCity(player);
    addCity(player);
    expect(game.milestones.some((m) => m.name === 'Mayor')).is.true;
    player2.setTerraformRating(player.terraformRating + 9);
    expect(card.canPlay(player)).is.false;
    player2.setTerraformRating(player.terraformRating + 10);
    expect(card.canPlay(player)).is.true;
  });

  it('claims a milestone for free even after 3 are claimed', () => {
    const card = new MonopolyBreakup();
    const [game, player, player2] = testGame(2);
    addCity(player);
    addCity(player);
    addCity(player);
    player2.setTerraformRating(player.terraformRating + 10);
    for (const m of game.milestones.filter((m) => m.name !== 'Mayor').slice(0, 3)) {
      game.claimedMilestones.push({player: player2, milestone: m});
    }
    player.megaCredits = 0;
    const orOptions = cast(card.play(player), OrOptions);
    const mayor = orOptions.options.find((o) => o.title === 'Mayor')!;
    mayor.cb(undefined);
    expect(game.claimedMilestones).has.length(4);
    expect(game.claimedMilestones[3].player).eq(player);
    expect(player.megaCredits).eq(0);
  });
});
