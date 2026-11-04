import {expect} from 'chai';
import {BiomassConversionPlant} from '../../../src/server/cards/robantilles/BiomassConversionPlant';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';

describe('BiomassConversionPlant', () => {
  it('turns 2 plants into 3 microbes', () => {
    const card = new BiomassConversionPlant();
    const tardigrades = new Tardigrades();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(tardigrades);
    player.plants = 2;
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(player.plants).eq(0);
    expect(tardigrades.resourceCount).eq(3);
  });
});
