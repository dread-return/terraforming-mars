import {expect} from 'chai';
import {VenusianTransports} from '../../../src/server/cards/betterments/VenusianTransports';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions, setVenusScaleLevel} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';

describe('VenusianTransports', () => {
  it('requires 12% Venus', () => {
    const card = new VenusianTransports();
    const [game, player] = testGame(2, {venusNextExtension: true});
    setVenusScaleLevel(game, 10);
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 12);
    expect(card.canPlay(player)).is.true;
  });

  it('gains 1 M€ per Venus tag', () => {
    const card = new VenusianTransports();
    const [game, player] = testGame(2, {venusNextExtension: true});
    player.playedCards.push(card, fakeCard({tags: [Tag.VENUS, Tag.VENUS]}));
    card.action(player);
    runAllActions(game);
    expect(player.megaCredits).eq(3);
  });
});
