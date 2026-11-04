import {expect} from 'chai';
import {GreatFaceOfCydonia} from '../../../src/server/cards/robantilles/GreatFaceOfCydonia';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';

describe('GreatFaceOfCydonia', () => {
  it('draws a fifth card in the research phase', () => {
    const card = new GreatFaceOfCydonia();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.megaCredits = 20;
    player.runResearchPhase();
    const selectCard = cast(player.popWaitingFor(), SelectCard);
    expect(selectCard.cards).has.length(5);
    expect(selectCard.config.max).eq(4);
  });
});
