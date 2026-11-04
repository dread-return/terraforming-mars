import {expect} from 'chai';
import {MicrobeColtures} from '../../../src/server/cards/betterments/MicrobeColtures';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast} from '../../../src/common/utils/utils';

describe('MicrobeColtures', () => {
  it('requires 2 science tags', () => {
    const card = new MicrobeColtures();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
  });

  it('spends heat to add microbes', () => {
    const card = new MicrobeColtures();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    expect(card.canAct(player)).is.false;
    player.heat = 5;
    card.action(player);
    runAllActions(game);
    const orOptions = cast(player.popWaitingFor(), OrOptions);
    orOptions.options[1].cb(undefined);
    runAllActions(game);
    expect(player.heat).eq(0);
    expect(card.resourceCount).eq(2);
  });

  it('scores 1 VP per 3 microbes', () => {
    const card = new MicrobeColtures();
    const [/* game */, player] = testGame(2);
    card.resourceCount = 7;
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
