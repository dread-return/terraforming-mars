import {expect} from 'chai';
import {HistoricalVideographicArchive} from '../../../src/server/cards/robantilles/HistoricalVideographicArchive';
import {testGame} from '../../TestGame';
import {MeteorShower} from '../../../src/server/cards/robantilles/MeteorShower';
import {SupernovaExplosion} from '../../../src/server/cards/robantilles/SupernovaExplosion';
import {InterplanetaryCruise} from '../../../src/server/cards/robantilles/InterplanetaryCruise';

describe('HistoricalVideographicArchive', () => {
  it('scores 1 VP per 3 events', () => {
    const card = new HistoricalVideographicArchive();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card, new MeteorShower(), new SupernovaExplosion());
    expect(card.getVictoryPoints(player)).eq(0);
    player.playedCards.push(new InterplanetaryCruise());
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
