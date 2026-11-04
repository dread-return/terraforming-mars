import {expect} from 'chai';
import {BaseOnTitan} from '../../../src/server/cards/betterments/BaseOnTitan';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('BaseOnTitan', () => {
  it('requires 3 Jovian tags and scores 1 VP per Jovian tag', () => {
    const card = new BaseOnTitan();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN, Tag.JOVIAN]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(card.getVictoryPoints(player)).eq(4);
  });

  it('spends 2 titanium to raise TR', () => {
    const card = new BaseOnTitan();
    const [game, player] = testGame(2);
    player.titanium = 2;
    const tr = player.terraformRating;
    card.action(player);
    runAllActions(game);
    expect(player.titanium).eq(0);
    expect(player.terraformRating).eq(tr + 1);
  });
});
