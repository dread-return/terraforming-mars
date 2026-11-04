import {expect} from 'chai';
import {MonumentToMars} from '../../../src/server/cards/robantilles/MonumentToMars';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('MonumentToMars', () => {
  it('raises M€ production 3 steps and scores per 2 Earth tags', () => {
    const card = new MonumentToMars();
    const [/* game */, player] = testGame(2);
    card.play(player);
    expect(player.production.megacredits).eq(3);
    player.playedCards.push(card, fakeCard({tags: [Tag.EARTH]}));
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
