import {expect} from 'chai';
import {FamilyAdvertising} from '../../../src/server/cards/betterments/FamilyAdvertising';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {Photoreflectors} from '../../../src/server/cards/betterments/Photoreflectors';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '../../../src/common/utils/utils';

describe('FamilyAdvertising', () => {
  it('reuses an action already used this generation', () => {
    const card = new FamilyAdvertising();
    const [game, player] = testGame(2);
    const reflectors = new Photoreflectors();
    player.playedCards.push(reflectors);
    player.energy = 4;
    expect(card.canPlay(player)).is.false;
    player.actionsThisGeneration.add(reflectors.name);
    expect(card.canPlay(player)).is.true;
    const tr = player.terraformRating;
    const selectCard = cast(card.play(player), SelectCard);
    selectCard.cb([reflectors]);
    runAllActions(game);
    expect(player.energy).eq(0);
    expect(player.terraformRating).eq(tr + 1);
  });
});
