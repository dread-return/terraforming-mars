import {expect} from 'chai';
import {VenusianHeatExchangers} from '../../../src/server/cards/betterments/VenusianHeatExchangers';
import {testGame} from '../../TestGame';
import {runAllActions, setVenusScaleLevel} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('VenusianHeatExchangers', () => {
  it('requires 14% Venus', () => {
    const card = new VenusianHeatExchangers();
    const [game, player] = testGame(2, {venusNextExtension: true});
    setVenusScaleLevel(game, 12);
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 14);
    expect(card.canPlay(player)).is.true;
  });

  it('trades 2 heat production for 1 TR', () => {
    const card = new VenusianHeatExchangers();
    const [game, player] = testGame(2, {venusNextExtension: true});
    expect(card.canAct(player)).is.false;
    player.production.override({heat: 2});
    const tr = player.terraformRating;
    card.action(player);
    runAllActions(game);
    const waitingFor = player.popWaitingFor();
    if (waitingFor instanceof OrOptions) {
      cast(waitingFor, OrOptions).options[0].cb(undefined);
      runAllActions(game);
    }
    expect(player.production.heat).eq(0);
    expect(player.terraformRating).eq(tr + 1);
  });
});
