import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {CardName} from '../../../src/common/cards/CardName';
import {IPreludeCard} from '../../../src/server/cards/prelude/IPreludeCard';
import {DoubleDown} from '../../../src/server/cards/promo/DoubleDown';
import {Merger} from '../../../src/server/cards/promo/Merger';
import {DeltaProject} from '../../../src/server/cards/delta/DeltaProject';
import {Biofuels} from '../../../src/server/cards/prelude/Biofuels';
import {DomeValley} from '../../../src/server/cards/eternity/DomeValley';
import {ClonedWorkforce} from '../../../src/server/cards/eternity/ClonedWorkforce';
import {UNCOPYABLE_PRELUDES} from '../../../src/server/cards/eternity/EternityUtils';

describe('Uncopyable preludes', () => {
  it('Merger, Delta Project and the double preludes are uncopyable', () => {
    expect(UNCOPYABLE_PRELUDES.has(CardName.MERGER)).is.true;
    expect(UNCOPYABLE_PRELUDES.has(CardName.DELTA_PROJECT)).is.true;
    expect(UNCOPYABLE_PRELUDES.has(CardName.DOME_VALLEY)).is.true;
    expect(UNCOPYABLE_PRELUDES.has(CardName.BIOFUELS)).is.false;
  });

  it('Double Down cannot copy Merger or Delta Project', () => {
    const [/* game */, player] = testGame(2, {preludeExtension: true, promoCardsOption: true, eternityExpansion: true});
    player.playedCards.push(new Merger(), new DeltaProject(), new DomeValley(), new Biofuels());
    const doubleDown = new DoubleDown();
    expect(doubleDown.canPlay(player)).is.true;
    const cloneable = (doubleDown as unknown as {cloneablePreludes(p: unknown): Array<IPreludeCard>}).cloneablePreludes(player);
    expect(cloneable.map((c) => c.name)).deep.eq([CardName.BIOFUELS]);
  });

  it('Double Down has nothing to copy with only Merger and Delta Project', () => {
    const [/* game */, player] = testGame(2, {preludeExtension: true, promoCardsOption: true});
    player.playedCards.push(new Merger(), new DeltaProject());
    expect(new DoubleDown().canPlay(player)).is.false;
  });

  it('Cloned Workforce cannot replay Merger or Delta Project', () => {
    const [/* game */, player] = testGame(2, {preludeExtension: true, promoCardsOption: true, eternityExpansion: true});
    player.playedCards.push(new Merger(), new DeltaProject(), new Biofuels());
    const replayable = (new ClonedWorkforce() as unknown as {replayable(p: unknown): Array<IPreludeCard>}).replayable(player);
    expect(replayable.map((c) => c.name)).deep.eq([CardName.BIOFUELS]);
  });
});
