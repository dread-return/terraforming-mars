import {expect} from 'chai';
import {TempleOfGaiaAtElysium} from '../../../src/server/cards/robantilles/TempleOfGaiaAtElysium';
import {testGame} from '../../TestGame';
import {setRulingParty, addGreenery} from '../../TestingUtils';
import {PartyName} from '../../../src/common/turmoil/PartyName';

describe('TempleOfGaiaAtElysium', () => {
  it('requires the Greens, and pays out per greenery', () => {
    const card = new TempleOfGaiaAtElysium();
    const [game, player] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.MARS);
    expect(card.canPlay(player)).is.false;
    setRulingParty(game, PartyName.GREENS);
    expect(card.canPlay(player)).is.true;
    addGreenery(player);
    addGreenery(player);
    addGreenery(player);
    card.play(player);
    expect(player.production.plants).eq(3);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
