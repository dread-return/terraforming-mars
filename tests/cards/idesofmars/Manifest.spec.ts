import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {IDES_OF_MARS_CARD_MANIFEST} from '../../../src/server/cards/idesofmars/IdesOfMarsCardManifest';
import {CardName} from '../../../src/common/cards/CardName';

describe('Ides of Mars manifest', () => {
  const names = new Set<string>(Object.keys(IDES_OF_MARS_CARD_MANIFEST.projectCards));

  function idesCardsInGame(game: ReturnType<typeof testGame>[0]) {
    const cards = [...game.projectDeck.drawPile, ...game.players.flatMap((p) => p.dealtProjectCards)];
    return cards.filter((c) => names.has(c.name));
  }

  it('has 64 cards', () => {
    expect(names.size).eq(64);
  });

  it('all cards but Mercurial Laboratory and the 3 fan-party cards join the deck with Colonies, Turmoil and Venus on', () => {
    const [game] = testGame(3, {idesofmarsExpansion: true, coloniesExtension: true, turmoilExtension: true, venusNextExtension: true});
    const inGame = idesCardsInGame(game).map((c) => c.name);
    expect(inGame).has.length(60);
    // Mercurial Laboratory only joins with Mercury vs Mars.
    expect(inGame).does.not.include(CardName.MERCURIAL_LABORATORY);
  });

  it('Mercurial Laboratory joins with Mercury vs Mars', () => {
    const [game] = testGame(3, {idesofmarsExpansion: true, coloniesExtension: true, turmoilExtension: true, venusNextExtension: true, mercuryExpansion: true});
    const inGame = idesCardsInGame(game).map((c) => c.name);
    expect(inGame).has.length(61);
    expect(inGame).includes(CardName.MERCURIAL_LABORATORY);
  });

  it('the 3 fan-party cards join with Giga Turmoil', () => {
    const [game] = testGame(3, {idesofmarsExpansion: true, coloniesExtension: true, turmoilExtension: true, venusNextExtension: true,
      gigaTurmoil: true, politicalAgendasExtension: 'Chairman'});
    const inGame = idesCardsInGame(game).map((c) => c.name);
    expect(inGame).has.length(63);
    expect(inGame).includes(CardName.FREE_CITY);
  });

  it('cards needing other expansions stay out without them', () => {
    const [game] = testGame(2, {idesofmarsExpansion: true});
    const inGame = idesCardsInGame(game).map((c) => c.name);
    // 12 cards need Colonies, Turmoil or Venus (Air Transport Company now too); Mercurial Laboratory needs Mercury vs Mars;
    // 3 need Giga Turmoil.
    expect(inGame).has.length(64 - 16);
    expect(inGame).does.not.include(CardName.AIR_TRANSPORT_COMPANY);
    expect(inGame).does.not.include(CardName.SPACE_PIRATES);
    expect(inGame).does.not.include(CardName.BACKSTABBING);
    expect(inGame).does.not.include(CardName.FLOATING_RIG);
  });

  it('no Ides cards when the module is off', () => {
    const [game] = testGame(2);
    expect(idesCardsInGame(game)).is.empty;
  });
});
