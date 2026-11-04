import {expect} from 'chai';
import {WildBoars} from '../../../src/server/cards/betterments/WildBoars';
import {testGame} from '../../TestGame';
import {runAllActions, setOxygenLevel} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('WildBoars', () => {
  it('requires 11% oxygen', () => {
    const card = new WildBoars();
    const [game, player] = testGame(2);
    setOxygenLevel(game, 10);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 11);
    expect(card.canPlay(player)).is.true;
  });

  it('adds an animal and removes an opponent plant', () => {
    const card = new WildBoars();
    const [game, player, player2] = testGame(2);
    player.playedCards.push(card);
    player2.plants = 3;
    card.action(player);
    runAllActions(game);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    // The first option removes a plant from the opponent.
    orOptions.options[0].cb(undefined);
    runAllActions(game);
    expect(player2.plants).eq(2);
    expect(card.resourceCount).eq(1);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
