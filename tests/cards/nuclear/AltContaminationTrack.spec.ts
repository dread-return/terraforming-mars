import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {TileType} from '../../../src/common/TileType';
import {CardResource} from '../../../src/common/CardResource';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {ALT_CONTAMINATION_TRACK, CONTAMINATION_TRACK, contaminationTrack} from '../../../src/common/nuclear/Contamination';

function radioactive(n: number) {
  return fakeCard({tags: Array(n).fill(Tag.RADIOACTIVE)});
}

describe('Alt. Contamination track', () => {
  it('is picked by the game option', () => {
    expect(contaminationTrack(false)).eq(CONTAMINATION_TRACK);
    expect(contaminationTrack(undefined)).eq(CONTAMINATION_TRACK);
    expect(contaminationTrack(true)).eq(ALT_CONTAMINATION_TRACK);
  });

  it('gives heat at 2, a Nuclear Zone at 4 and energy at 6', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true, altContaminationTrack: true});
    player.onCardPlayed(radioactive(2));
    runAllActions(game);
    expect(player.heat).eq(1);
    expect(player.popWaitingFor()).is.undefined;

    player.onCardPlayed(radioactive(2));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    expect(select.spaces[0].tile?.tileType).eq(TileType.NUCLEAR_ZONE);

    player.onCardPlayed(radioactive(2));
    runAllActions(game);
    expect(player.energy).eq(1);
    expect(game.contamination).eq(6);
  });

  it('gives 2 data at 14 and a science resource at 18', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true, altContaminationTrack: true});
    const dataCard = fakeCard({resourceType: CardResource.DATA});
    const scienceCard = fakeCard({resourceType: CardResource.SCIENCE});
    player.playedCards.push(dataCard, scienceCard);
    game.contamination = 13;
    player.onCardPlayed(radioactive(1));
    runAllActions(game);
    expect(dataCard.resourceCount).eq(2);
    game.contamination = 17;
    player.onCardPlayed(radioactive(1));
    runAllActions(game);
    expect(scienceCard.resourceCount).eq(1);
  });

  it('stops at 20, where it gives 2 radiation', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true, altContaminationTrack: true});
    const holder = fakeCard({resourceType: CardResource.RADIATION});
    player.playedCards.push(holder);
    game.contamination = 19;
    player.onCardPlayed(radioactive(3));
    runAllActions(game);
    expect(game.contamination).eq(20);
    expect(holder.resourceCount).eq(2);
  });

  it('the standard track is unchanged without the option', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    player.onCardPlayed(radioactive(2));
    runAllActions(game);
    expect(player.heat).eq(0);
    game.contamination = 18;
    player.onCardPlayed(radioactive(4));
    expect(game.contamination).eq(19);
  });
});
