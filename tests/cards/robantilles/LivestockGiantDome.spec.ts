import {expect} from 'chai';
import {LivestockGiantDome} from '../../../src/server/cards/robantilles/LivestockGiantDome';
import {testGame} from '../../TestGame';
import {runAllActions, setOxygenLevel} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {TileType} from '../../../src/common/TileType';
import {Birds} from '../../../src/server/cards/base/Birds';

describe('LivestockGiantDome', () => {
  it('places the Animal Dome and plays an animal card for free', () => {
    const card = new LivestockGiantDome();
    const birds = new Birds();
    const [game, player] = testGame(2);
    setOxygenLevel(game, 8);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 7);
    expect(card.canPlay(player)).is.true;
    player.cardsInHand.push(birds);
    const selectSpace = cast(card.play(player), SelectSpace);
    const space = selectSpace.spaces[0];
    selectSpace.cb(space);
    expect(space.tile?.tileType).eq(TileType.ANIMAL_DOME);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([birds]);
    runAllActions(game);
    expect(player.playedCards.has(birds.name)).is.true;
    expect(player.megaCredits).eq(0);
  });
});
