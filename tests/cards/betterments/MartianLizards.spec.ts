import {expect} from 'chai';
import {MartianLizards} from '../../../src/server/cards/betterments/MartianLizards';
import {testGame} from '../../TestGame';
import {runAllActions, setTemperature} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('MartianLizards', () => {
  it('requires -2 C', () => {
    const card = new MartianLizards();
    const [game, player] = testGame(2);
    setTemperature(game, -4);
    expect(card.canPlay(player)).is.false;
    setTemperature(game, -2);
    expect(card.canPlay(player)).is.true;
  });

  it('spends heat to add animals here', () => {
    const card = new MartianLizards();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    player.heat = 7;
    card.action(player);
    runAllActions(game);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[1].cb(undefined);
    runAllActions(game);
    expect(player.heat).eq(1);
    expect(card.resourceCount).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
