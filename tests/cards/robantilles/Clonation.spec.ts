import {expect} from 'chai';
import {Clonation} from '../../../src/server/cards/robantilles/Clonation';
import {testGame} from '../../TestGame';
import {setRulingParty} from '../../TestingUtils';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Birds} from '../../../src/server/cards/base/Birds';

describe('Clonation', () => {
  it('requires Scientists and adds an animal to each card with animals', () => {
    const card = new Clonation();
    const birds = new Birds();
    const [game, player] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.GREENS);
    expect(card.canPlay(player)).is.false;
    setRulingParty(game, PartyName.SCIENTISTS);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(birds);
    birds.resourceCount = 1;
    card.play(player);
    expect(birds.resourceCount).eq(2);
  });
});
