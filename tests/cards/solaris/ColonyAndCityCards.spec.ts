import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions, setRulingParty} from '../../TestingUtils';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {EinsteinRosenGateway} from '../../../src/server/cards/solaris/EinsteinRosenGateway';
import {TradeAgreements} from '../../../src/server/cards/solaris/TradeAgreements';
import {Sideralis} from '../../../src/server/cards/solaris/Sideralis';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {addCity} from '../../TestingUtils';

describe('Solaris colony and city cards', () => {
  it('Einstein-Rosen Gateway: trades for free but uses a trade fleet', () => {
    const card = new EinsteinRosenGateway();
    const [game, player] = testGame(2, {coloniesExtension: true});
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(card);
    expect(card.canAct(player)).is.true;
    const selectColony = cast(card.action(player), SelectColony);
    const colony = selectColony.colonies[0];
    selectColony.cb(colony);
    runAllActions(game);
    expect(player.colonies.usedTradeFleets).eq(1);
    expect(card.canAct(player)).is.false;
  });

  it('Trade Agreements: pay 2 steel or 2 plants to trade; 1 VP per colony', () => {
    const card = new TradeAgreements();
    const [game, player] = testGame(2, {coloniesExtension: true, turmoilExtension: true});
    expect(card.canPlay(player)).is.false;
    setRulingParty(game, PartyName.UNITY);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(card.canAct(player)).is.false;
    player.steel = 2;
    player.plants = 2;
    const orOptions = cast(card.action(player), OrOptions);
    orOptions.options[1].cb();
    expect(player.plants).eq(0);
    expect(player.steel).eq(2);
    runAllActions(game);
    const selectColony = cast(player.popWaitingFor(), SelectColony);
    selectColony.cb(selectColony.colonies[0]);
    runAllActions(game);
    expect(player.colonies.usedTradeFleets).eq(1);
    expect(card.getVictoryPoints(player)).eq(0);
    game.colonies[1].addColony(player);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Sideralis: needs an off-world city, goes on its reserved space', () => {
    const card = new Sideralis();
    const [game, player] = testGame(2, {solarisExpansion: true});
    expect(game.board.getSpaceOrThrow(SpaceName.SIDERALIS)).is.not.undefined;
    expect(card.canPlay(player)).is.false;
    addCity(player);
    expect(card.canPlay(player)).is.false;
    addCity(player, SpaceName.GANYMEDE_COLONY);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    expect(game.board.getSpaceOrThrow(SpaceName.SIDERALIS).player).eq(player);
    expect(player.production.titanium).eq(1);
    expect(player.production.megacredits).eq(4);
    player.playedCards.push(card);
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
