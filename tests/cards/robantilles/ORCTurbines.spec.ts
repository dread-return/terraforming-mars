import {expect} from 'chai';
import {ORCTurbines} from '../../../src/server/cards/robantilles/ORCTurbines';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {Resource} from '../../../src/common/Resource';

describe('ORCTurbines', () => {
  it('turns heat into energy', () => {
    const card = new ORCTurbines();
    const [/* game */, player] = testGame(2);
    expect(card.canAct(player)).is.false;
    player.heat = 7;
    const selectAmount = cast(card.action(player), SelectAmount);
    expect(selectAmount.max).eq(3);
    selectAmount.cb(3);
    expect(player.heat).eq(1);
    expect(player.energy).eq(3);
  });

  it('pays a missing energy production step with 2 heat production', () => {
    const card = new ORCTurbines();
    const [/* game */, player] = testGame(2);
    player.production.override({heat: 2});
    expect(player.production.canAdjust({megacredits: 0, steel: 0, titanium: 0, plants: 0, energy: -1, heat: 0})).is.false;
    player.playedCards.push(card);
    expect(player.production.canAdjust({megacredits: 0, steel: 0, titanium: 0, plants: 0, energy: -1, heat: 0})).is.true;
    player.production.add(Resource.ENERGY, -1);
    expect(player.production.heat).eq(0);
    expect(player.production.energy).eq(0);
  });
});
