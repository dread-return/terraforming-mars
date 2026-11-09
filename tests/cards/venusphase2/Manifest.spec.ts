import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {VENUS_PHASE_2_CARD_MANIFEST} from '../../../src/server/cards/venusphase2/VenusPhase2CardManifest';
import {CardName} from '../../../src/common/cards/CardName';
import {IGame} from '../../../src/server/IGame';

describe('Venus Phase 2 manifest', () => {
  const names = new Set<string>(Object.keys(VENUS_PHASE_2_CARD_MANIFEST.projectCards));

  function inGame(game: IGame) {
    return [...game.projectDeck.drawPile, ...game.players.flatMap((p) => p.dealtProjectCards)]
      .map((c) => c.name)
      .filter((name) => names.has(name));
  }

  it('has 45 project cards and 3 standard projects', () => {
    expect(names.size).eq(45);
    expect(Object.keys(VENUS_PHASE_2_CARD_MANIFEST.standardProjects)).has.length(3);
  });

  it('all cards with Colonies and Turmoil', () => {
    const [game] = testGame(3, {venusNextExtension: true, venusPhase2Expansion: true, coloniesExtension: true, turmoilExtension: true});
    expect(inGame(game)).has.length(45);
  });

  it('colony cards need Colonies, New Rome needs Turmoil', () => {
    const [game] = testGame(2, {venusNextExtension: true, venusPhase2Expansion: true});
    const cards = inGame(game);
    expect(cards).has.length(40);
    expect(cards).does.not.include(CardName.SISTER_COLONIES);
    expect(cards).does.not.include(CardName.NEW_ROME);
  });

  it('no cards when the module is off', () => {
    const [game] = testGame(2, {venusNextExtension: true});
    expect(inGame(game)).is.empty;
  });
});
