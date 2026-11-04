import {expect} from 'chai';
import {AlgorithmicTrading} from '../../../src/server/cards/robantilles/AlgorithmicTrading';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('AlgorithmicTrading', () => {
  it('requires a science tag and buys M€ production', () => {
    const card = new AlgorithmicTrading();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(2);
    player.megaCredits = 8;
    card.action(player);
    runAllActions(game);
    expect(player.production.megacredits).eq(4);
    expect(player.megaCredits).eq(0);
  });
});
