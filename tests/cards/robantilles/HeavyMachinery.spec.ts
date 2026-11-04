import {expect} from 'chai';
import {HeavyMachinery} from '../../../src/server/cards/robantilles/HeavyMachinery';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';

describe('HeavyMachinery', () => {
  it('buys titanium production and discounts the City standard project', () => {
    const card = new HeavyMachinery();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.BUILDING]}));
    expect(card.canPlay(player)).is.true;
    player.megaCredits = 11;
    card.action(player);
    runAllActions(game);
    expect(player.production.titanium).eq(1);
    expect(player.megaCredits).eq(0);
    expect(card.getStandardProjectDiscount(player, new CityStandardProject())).eq(1);
  });
});
