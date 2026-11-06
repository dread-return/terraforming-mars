import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {Omegalaxy} from '../../../src/server/cards/solaris/Omegalaxy';
import {GameCards} from '../../../src/server/GameCards';
import {DEFAULT_GAME_OPTIONS} from '../../../src/server/game/GameOptions';
import {CardName} from '../../../src/common/cards/CardName';

describe('Omegalaxy', () => {
  it('discounts space, Jovian and Galactic tags per tag', () => {
    const card = new Omegalaxy();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    expect(player.getCardCost(fakeCard({cost: 20, tags: [Tag.SPACE]}))).eq(19);
    expect(player.getCardCost(fakeCard({cost: 20, tags: [Tag.JOVIAN, Tag.SPACE]}))).eq(16);
    expect(player.getCardCost(fakeCard({cost: 20, tags: [Tag.SPACE, Tag.GALACTIC, Tag.GALACTIC]}))).eq(9);
    expect(player.getCardCost(fakeCard({cost: 20, tags: [Tag.EARTH]}))).eq(20);
    expect(player.tags.count(Tag.GALACTIC)).eq(1);
  });
});

describe('Solaris deck', () => {
  it('includes Self-Replicating Robots without Promos, and Omegalaxy', () => {
    const cards = new GameCards({...DEFAULT_GAME_OPTIONS, solarisExpansion: true});
    expect(cards.getProjectCards().map((c) => c.name)).includes(CardName.SELF_REPLICATING_ROBOTS);
    expect(cards.getProjectCards().map((c) => c.name)).includes(CardName.STELLAR_ENGINE);
    expect(cards.getProjectCards().map((c) => c.name)).not.includes(CardName.WISH_MACHINE);
    expect(cards.getCorporationCards().map((c) => c.name)).includes(CardName.OMEGALAXY);

    const withoutSolaris = new GameCards({...DEFAULT_GAME_OPTIONS});
    expect(withoutSolaris.getProjectCards().map((c) => c.name)).not.includes(CardName.SELF_REPLICATING_ROBOTS);
  });
});
