import {expect} from 'chai';
import {MartianRangers} from '../../../src/server/cards/robantilles/MartianRangers';
import {testGame} from '../../TestGame';
import {Birds} from '../../../src/server/cards/base/Birds';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {CardResource} from '../../../src/common/CardResource';
import {RemoveResourcesFromCard} from '../../../src/server/deferredActions/RemoveResourcesFromCard';

describe('MartianRangers', () => {
  it('adds 2 animals to a card with animals and protects them', () => {
    const card = new MartianRangers();
    const birds = new Birds();
    const [/* game */, player, player2] = testGame(2);
    player.playedCards.push(birds);
    birds.resourceCount = 1;
    expect(RemoveResourcesFromCard.getAvailableTargetCards(player2, CardResource.ANIMAL)).includes(birds);
    cast(card.play(player), SelectCard).cb([birds]);
    expect(birds.resourceCount).eq(3);
    player.playedCards.push(card);
    expect(RemoveResourcesFromCard.getAvailableTargetCards(player2, CardResource.ANIMAL)).does.not.include(birds);
  });
});
