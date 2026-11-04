import {expect} from 'chai';
import {TharsisColossus} from '../../../src/server/cards/robantilles/TharsisColossus';
import {testGame} from '../../TestGame';
import {setRulingParty, fakeCard} from '../../TestingUtils';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Tag} from '../../../src/common/cards/Tag';

describe('TharsisColossus', () => {
  it('requires Mars First and scores 1 VP per 3 building tags', () => {
    const card = new TharsisColossus();
    const [game, player] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.GREENS);
    expect(card.canPlay(player)).is.false;
    setRulingParty(game, PartyName.MARS);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    player.playedCards.push(fakeCard({tags: [Tag.BUILDING, Tag.BUILDING]}));
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
