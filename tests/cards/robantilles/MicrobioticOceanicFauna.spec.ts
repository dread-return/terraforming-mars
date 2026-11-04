import {expect} from 'chai';
import {MicrobioticOceanicFauna} from '../../../src/server/cards/robantilles/MicrobioticOceanicFauna';
import {testGame} from '../../TestGame';
import {maxOutOceans} from '../../TestingUtils';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';

describe('MicrobioticOceanicFauna', () => {
  it('requires 3 oceans and discounts microbe cards', () => {
    const card = new MicrobioticOceanicFauna();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    maxOutOceans(player, 3);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(player.getCardCost(new Tardigrades())).eq(1);
  });
});
