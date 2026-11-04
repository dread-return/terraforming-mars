import {expect} from 'chai';
import {RooftopGardensOfNoctis} from '../../../src/server/cards/robantilles/RooftopGardensOfNoctis';
import {testGame} from '../../TestGame';
import {addCity} from '../../TestingUtils';

describe('RooftopGardensOfNoctis', () => {
  it('raises plant production and scores 1 VP per city on Mars', () => {
    const card = new RooftopGardensOfNoctis();
    const [/* game */, player, player2] = testGame(2);
    card.play(player);
    expect(player.production.plants).eq(1);
    addCity(player);
    addCity(player2);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
