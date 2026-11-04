import {expect} from 'chai';
import {MartianArmedForces} from '../../../src/server/cards/robantilles/MartianArmedForces';
import {testGame} from '../../TestGame';
import {Resource} from '../../../src/common/Resource';
import {StealResources} from '../../../src/server/deferredActions/StealResources';

describe('MartianArmedForces', () => {
  it('protects M€, steel and titanium from opponents', () => {
    const card = new MartianArmedForces();
    const [/* game */, player, player2] = testGame(2);
    player.megaCredits = 10;
    player.steel = 5;
    expect(StealResources.getCandidates(player2, Resource.MEGACREDITS, 2)).includes(player);
    player.playedCards.push(card);
    expect(StealResources.getCandidates(player2, Resource.MEGACREDITS, 2)).does.not.include(player);
    expect(StealResources.getCandidates(player2, Resource.STEEL, 2)).does.not.include(player);
    expect(player.alloysAreProtected()).is.true;
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
