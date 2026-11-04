import {expect} from 'chai';
import {IoThermalization} from '../../../src/server/cards/betterments/IoThermalization';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('IoThermalization', () => {
  it('converts titanium to heat production, or heat production to TR', () => {
    const card = new IoThermalization();
    const [game, player] = testGame(2);
    expect(card.canAct(player)).is.false;
    player.titanium = 1;
    player.production.override({heat: 2});
    card.action(player);
    runAllActions(game);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[0].cb(undefined);
    runAllActions(game);
    expect(player.titanium).eq(0);
    expect(player.production.heat).eq(3);

    const tr = player.terraformRating;
    card.action(player);
    runAllActions(game);
    // Only the second option is available now, so it may be chosen automatically.
    const next = player.popWaitingFor();
    if (next instanceof OrOptions) {
      next.options[next.options.length - 1].cb(undefined);
      runAllActions(game);
    }
    expect(player.production.heat).eq(1);
    expect(player.terraformRating).eq(tr + 1);
  });
});
