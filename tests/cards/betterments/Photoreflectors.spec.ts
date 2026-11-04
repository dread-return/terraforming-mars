import {expect} from 'chai';
import {Photoreflectors} from '../../../src/server/cards/betterments/Photoreflectors';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';

describe('Photoreflectors', () => {
  it('spends 4 energy to raise TR', () => {
    const card = new Photoreflectors();
    const [game, player] = testGame(2);
    player.energy = 3;
    expect(card.canAct(player)).is.false;
    player.energy = 4;
    expect(card.canAct(player)).is.true;
    const tr = player.terraformRating;
    card.action(player);
    runAllActions(game);
    expect(player.energy).eq(0);
    expect(player.terraformRating).eq(tr + 1);
  });
});
