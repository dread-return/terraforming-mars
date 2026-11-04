import {expect} from 'chai';
import {SpaceRobots} from '../../../src/server/cards/robantilles/SpaceRobots';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {ExtraVehicularActivities} from '../../../src/server/cards/robantilles/ExtraVehicularActivities';

describe('SpaceRobots', () => {
  it('copies the production box of a space card', () => {
    const card = new SpaceRobots();
    const eva = new ExtraVehicularActivities();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(eva);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([eva]);
    expect(player.production.megacredits).eq(2);
  });
});
