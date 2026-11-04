import {expect} from 'chai';
import {SmugglingOperations} from '../../../src/server/cards/betterments/SmugglingOperations';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {Luna} from '../../../src/server/colonies/Luna';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {cast} from '../../../src/common/utils/utils';

describe('SmugglingOperations', () => {
  it('gains the trade and colony bonus without moving the track', () => {
    const card = new SmugglingOperations();
    const [game, player, player2] = testGame(2, {coloniesExtension: true});
    const luna = new Luna();
    game.colonies.splice(0, game.colonies.length, luna);
    luna.colonies.push(player2.id);
    luna.trackPosition = 2;
    player.megaCredits = 0;
    player2.megaCredits = 0;
    const selectColony = cast(card.play(player), SelectColony);
    selectColony.cb(luna);
    runAllActions(game);
    // Luna pays 4 M€ for a trade at position 2, and 2 M€ as its colony bonus.
    expect(player.megaCredits).eq(6);
    expect(player2.megaCredits).eq(0);
    expect(luna.trackPosition).eq(2);
    expect(player.colonies.usedTradeFleets).eq(0);
  });
});
