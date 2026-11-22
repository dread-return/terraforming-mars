import {expect} from 'chai';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

import {Zan} from '../../../src/server/cards/ceos/Zan';
import {ReleaseOfInertGases} from '../../../src/server/cards/base/ReleaseOfInertGases';
import {forceGenerationEnd, setRulingParty, runAllActions} from '../../TestingUtils';
import {BOARD_ORDER, Turmoil} from '../../../src/server/turmoil/Turmoil';
import {GIGA_PARTIES_IN_PLAY, PartyName} from '../../../src/common/turmoil/PartyName';
import {TPolitician} from '../../../src/server/awards/terraCimmeria/TPolitician';

describe('Zan', () => {
  let card: Zan;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new Zan();
    [game, player] = testGame(2, {ceoExtension: true, turmoilExtension: true});

    player.playedCards.push(card);
  });

  it('Not affected by Reds policy when raising TR', () => {
    setRulingParty(game, PartyName.REDS);

    player.megaCredits = 3;
    player.increaseTerraformRating();
    game.deferredActions.runNext();
    expect(player.megaCredits).eq(3);
  });

  it('Not affected by Reds policy when checking canPlay for cards that give TR', () => {
    player.megaCredits = 14;
    const releaseOfInertGases = new ReleaseOfInertGases();
    expect(releaseOfInertGases.canPlay(player)).is.true;
  });

  it('Takes OPG action', () => {
    const turmoil = game.turmoil!;
    player.megaCredits = 0;
    const expectedMegagredits = turmoil.delegateReserve.get(player);
    card.action(player);
    while (game.deferredActions.length) {
      game.deferredActions.pop()!.execute();
    }

    expect(turmoil.delegateReserve.get(player)).eq(0);
    expect(player.megaCredits).eq(expectedMegagredits);

    expect(turmoil.dominantParty.name).eq(PartyName.REDS);
    expect(turmoil.dominantParty.partyLeader).eq(player);
    expect(card.isDisabled).is.true;
  });

  it('Cannot act when Giga Turmoil leaves Reds out, and never loops forever', () => {
    const [gigaGame, gigaPlayer] = testGame(2, {ceoExtension: true, turmoilExtension: true, gigaTurmoil: true});
    const zan = new Zan();
    gigaPlayer.playedCards.push(zan);
    const turmoil = Turmoil.getTurmoil(gigaGame);
    turmoil.startGigaGovernment(gigaGame, BOARD_ORDER.filter((name) => name !== PartyName.REDS).slice(0, GIGA_PARTIES_IN_PLAY));

    expect(turmoil.isInPlay(PartyName.REDS)).is.false;
    expect(zan.canAct(gigaPlayer)).is.false;
    // Even if something forces the action, it must end.
    zan.action(gigaPlayer);
    expect(zan.isDisabled).is.true;
  });

  it('OPG Counts for POLITICIAN Award', () => {
    const politician = new TPolitician();
    game.awards = [];
    game.awards.push(politician);
    const preOPGScore = game.awards[0].getScore(player);
    card.action(player);
    runAllActions(game);
    expect(game.awards[0].getScore(player)).eq(preOPGScore+7);
  });

  it('Can only act once per game', () => {
    card.action(player);
    forceGenerationEnd(game);

    expect(card.isDisabled).is.true;
    expect(card.canAct(player)).is.false;
  });
});
