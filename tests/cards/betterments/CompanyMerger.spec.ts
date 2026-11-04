import {expect} from 'chai';
import {CompanyMerger} from '../../../src/server/cards/betterments/CompanyMerger';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {cast} from '../../../src/common/utils/utils';
import {CardType} from '../../../src/common/cards/CardType';

describe('CompanyMerger', () => {
  it('merges with a second corporation and plays a prelude', () => {
    const card = new CompanyMerger();
    const [game, player] = testGame(2, {preludeExtension: true});
    card.play(player);
    runAllActions(game);
    const corps = cast(player.popWaitingFor(), SelectCard);
    expect(corps.cards).has.length(2);
    const corp = corps.cards[0];
    corps.cb([corp]);
    runAllActions(game);
    expect(player.tableau.has(corp.name)).is.true;
    // Some corporations ask their own questions first; answer those with their first option.
    let waitingFor = player.popWaitingFor();
    for (let i = 0; i < 5 && !(waitingFor instanceof SelectCard && waitingFor.cards[0].type === CardType.PRELUDE); i++) {
      expect(waitingFor).is.not.undefined;
      waitingFor!.cb(undefined as never);
      runAllActions(game);
      waitingFor = player.popWaitingFor();
    }
    const preludes = cast(waitingFor, SelectCard);
    expect(preludes.cards).has.length(2);
    expect(preludes.cards.every((c) => c.type === CardType.PRELUDE)).is.true;
  });
});
