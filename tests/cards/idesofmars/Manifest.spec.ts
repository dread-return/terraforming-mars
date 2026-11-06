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

  it('has 61 cards', () => {
    expect(names.size).eq(61);
  });

  it('all cards join the deck with Colonies, Turmoil and Venus on', () => {
    const [game] = testGame(3, {idesofmarsExpansion: true, coloniesExtension: true, turmoilExtension: true, venusNextExtension: true});
    expect(idesCardsInGame(game)).has.length(61);
  });

  it('cards needing other expansions stay out without them', () => {
    const [game] = testGame(2, {idesofmarsExpansion: true});
    const inGame = idesCardsInGame(game).map((c) => c.name);
    expect(inGame).has.length(61 - 11);
    expect(inGame).does.not.include(CardName.SPACE_PIRATES);
    expect(inGame).does.not.include(CardName.BACKSTABBING);
    expect(inGame).does.not.include(CardName.FLOATING_RIG);
  });

  it('no Ides cards when the module is off', () => {
    const [game] = testGame(2);
    expect(idesCardsInGame(game)).is.empty;
  });
});
