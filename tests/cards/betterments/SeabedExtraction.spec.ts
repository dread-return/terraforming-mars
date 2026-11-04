import {expect} from 'chai';
import {SeabedExtraction} from '../../../src/server/cards/betterments/SeabedExtraction';
import {testGame} from '../../TestGame';
import {maxOutOceans} from '../../TestingUtils';

describe('SeabedExtraction', () => {
  it('gains steel per ocean', () => {
    const card = new SeabedExtraction();
    const [/* game */, player] = testGame(2);
    maxOutOceans(player, 4);
    player.steel = 0; // Ignore placement bonuses from the oceans.
    card.play(player);
    expect(player.steel).eq(4);
  });
});
