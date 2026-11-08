import {expect} from 'chai';
import {GIGAInterferometer} from '../../../src/server/cards/robantilles/GIGAInterferometer';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {IProjectCard} from '../../../src/server/cards/IProjectCard';

describe('GIGAInterferometer with drafting', () => {
  it('drafts the 4 cards (keep 1, pass the rest), then everyone buys', () => {
    const card = new GIGAInterferometer();
    const [game, player, player2, player3] = testGame(3, {draftVariant: true});
    for (const p of [player, player2, player3]) {
      p.megaCredits = 20;
    }
    card.play(player);
    runAllActions(game);

    const players = game.players;
    const names = (cards: ReadonlyArray<IProjectCard>) => cards.map((c) => c.name).sort();
    let previous: Array<Array<IProjectCard>> = [];
    // Three rounds of picks: hands of 4, 3 and 2 cards.
    for (const size of [4, 3, 2]) {
      const hands: Array<Array<IProjectCard>> = [];
      players.forEach((p, i) => {
        const select = cast(p.popWaitingFor(), SelectCard<IProjectCard>);
        expect(select.cards).has.length(size);
        if (previous.length > 0) {
          // Generation 1 is odd, so hands pass to the previous player: player i gets player i+1's hand.
          expect(names(select.cards)).deep.eq(names(previous[(i + 1) % players.length]));
        }
        hands.push(select.cards.slice(1));
        select.cb([select.cards[0]]);
        runAllActions(game);
      });
      previous = hands;
    }
    // Each player now buys from the 4 cards they drafted.
    let bought = 0;
    for (const p of game.playersInGenerationOrder) {
      const choose = cast(p.popWaitingFor(), SelectCard<IProjectCard>);
      expect(choose.cards).has.length(4);
      choose.cb([choose.cards[0]]);
      runAllActions(game);
      bought++;
    }
    expect(bought).eq(3);
    for (const p of game.players) {
      expect(p.cardsInHand).has.length(1);
      expect(p.megaCredits).eq(17);
    }
  });

  it('without drafting, everyone draws 4 and buys', () => {
    const card = new GIGAInterferometer();
    const [game, player, player2] = testGame(2);
    player.megaCredits = 6;
    player2.megaCredits = 6;
    card.play(player);
    runAllActions(game);
    expect(cast(player.popWaitingFor(), SelectCard).cards).has.length(4);
  });
});
