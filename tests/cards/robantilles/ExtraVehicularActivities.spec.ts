import {expect} from 'chai';
import {ExtraVehicularActivities} from '../../../src/server/cards/robantilles/ExtraVehicularActivities';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('ExtraVehicularActivities', () => {
  it('requires 2 space tags and raises M€ production 2 steps', () => {
    const card = new ExtraVehicularActivities();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(2);
  });
});
