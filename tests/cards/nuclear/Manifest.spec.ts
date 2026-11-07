import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {NUCLEAR_CARD_MANIFEST} from '../../../src/server/cards/nuclear/NuclearCardManifest';
import {CardName} from '../../../src/common/cards/CardName';

describe('Nuclear manifest', () => {
  const names = new Set<string>(Object.keys(NUCLEAR_CARD_MANIFEST.projectCards));
  const preludes = new Set<string>(Object.keys(NUCLEAR_CARD_MANIFEST.preludeCards));

  function nuclearCardsInGame(game: ReturnType<typeof testGame>[0]) {
    const cards = [...game.projectDeck.drawPile, ...game.players.flatMap((p) => p.dealtProjectCards)];
    return cards.filter((c) => names.has(c.name));
  }

  it('has 78 project cards and 5 preludes', () => {
    expect(names.size).eq(78);
    expect(preludes.size).eq(5);
    expect(preludes.has(CardName.SPACE_SOLARIUM)).is.false;
  });

  it('all cards join the deck with Colonies on', () => {
    const [game] = testGame(3, {nuclearExpansion: true, coloniesExtension: true});
    expect(nuclearCardsInGame(game)).has.length(78);
  });

  it('Oberon Trading Station needs Colonies', () => {
    const [game] = testGame(2, {nuclearExpansion: true});
    const inGame = nuclearCardsInGame(game).map((c) => c.name);
    expect(inGame).has.length(77);
    expect(inGame).does.not.include(CardName.OBERON_TRADING_STATION);
  });

  it('no Nuclear cards when the module is off', () => {
    const [game] = testGame(2);
    expect(nuclearCardsInGame(game)).is.empty;
  });

  it('the Main Docking Station space only exists with Nuclear', () => {
    const [game] = testGame(2, {nuclearExpansion: true});
    expect(game.board.getSpaceOrThrow('c80')).is.not.undefined;
    const [plain] = testGame(2);
    expect(plain.board.spaces.find((s) => s.id === 'c80')).is.undefined;
  });
});
