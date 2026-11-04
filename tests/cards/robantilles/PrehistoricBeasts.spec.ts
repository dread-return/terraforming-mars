import {expect} from 'chai';
import {PrehistoricBeasts} from '../../../src/server/cards/robantilles/PrehistoricBeasts';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('PrehistoricBeasts', () => {
  it('requires 5 science tags, and turns plants into animals', () => {
    const card = new PrehistoricBeasts();
    const [game, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.megacredits).eq(2);
    expect(card.canAct(player)).is.false;
    player.plants = 2;
    card.action(player);
    runAllActions(game);
    expect(card.resourceCount).eq(1);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
