import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {resolve} from './resolve';
import {PublicSponsoredGrant} from '../../../src/server/cards/pathfinders/PublicSponsoredGrant';
import {Tate} from '../../../src/server/cards/ceos/Tate';
import {Diversifier} from '../../../src/server/milestones/Diversifier';
import {Trader} from '../../../src/server/milestones/modular/Trader';
import {Tradesman} from '../../../src/server/milestones/Tradesman';
import {CEOsFavoriteProject} from '../../../src/server/cards/base/CEOsFavoriteProject';
import {AppliedScience} from '../../../src/server/cards/prelude2/AppliedScience';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Fish} from '../../../src/server/cards/base/Fish';
import {RadiationShielding} from '../../../src/server/cards/nuclear/RadiationShielding';
import {EnergizingLava} from '../../../src/server/cards/nuclear/EnergizingLava';
import {ParticleAccelerator} from '../../../src/server/cards/nuclear/ParticleAccelerator';

function optionTitles(or: OrOptions): Array<string> {
  return or.options.map((o) => String(typeof o.title === 'string' ? o.title : JSON.stringify(o.title)));
}

describe('Nuclear with other modules', () => {
  it('Radioactive is one of the game\'s tags when Nuclear is on, and not otherwise', () => {
    const [game] = testGame(2, {nuclearExpansion: true});
    expect(game.tags).includes(Tag.RADIOACTIVE);
    const [plain] = testGame(2);
    expect(plain.tags).does.not.include(Tag.RADIOACTIVE);
  });

  it('Public Sponsored Grant offers the radioactive tag', () => {
    const [, player] = testGame(2, {nuclearExpansion: true, pathfindersExpansion: true});
    const or = cast(new PublicSponsoredGrant().play(player), OrOptions);
    expect(optionTitles(or).some((t) => t.includes(Tag.RADIOACTIVE))).is.true;
  });

  it('Tate offers the radioactive tag', () => {
    const [, player] = testGame(2, {nuclearExpansion: true, ceoExtension: true});
    const or = cast(new Tate().action(player), OrOptions);
    expect(optionTitles(or).some((t) => t.includes(Tag.RADIOACTIVE))).is.true;
  });

  it('a wild tag counts as a radioactive tag for requirements', () => {
    const [, player] = testGame(2, {nuclearExpansion: true});
    const card = new ParticleAccelerator(); // needs 2 science tags
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.WILD]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(fakeCard({tags: [Tag.WILD]}));
    expect(player.tags.count(Tag.RADIOACTIVE)).eq(2);
  });

  it('Diversifier counts the radioactive tag as a different tag', () => {
    const [, player] = testGame(2, {nuclearExpansion: true});
    player.playedCards.push(fakeCard({tags: [Tag.BUILDING, Tag.SPACE, Tag.SCIENCE, Tag.POWER, Tag.EARTH, Tag.JOVIAN, Tag.PLANT]}));
    expect(new Diversifier().getScore(player)).eq(7);
    player.playedCards.push(fakeCard({tags: [Tag.RADIOACTIVE]}));
    expect(new Diversifier().getScore(player)).eq(8);
  });

  it('Radiation counts as a resource type for Trader and Tradesman', () => {
    const [, player] = testGame(2, {nuclearExpansion: true});
    const tardigrades = new Tardigrades();
    tardigrades.resourceCount = 1;
    const fish = new Fish();
    fish.resourceCount = 1;
    const shielding = new RadiationShielding();
    shielding.resourceCount = 1;
    player.playedCards.push(tardigrades, fish);
    expect(new Trader().getScore(player)).eq(2);
    player.playedCards.push(shielding);
    expect(new Trader().getScore(player)).eq(3);
    expect(new Tradesman().getScore(player)).eq(3);
  });

  it('CEO\'s Favorite Project can add a radiation', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    const lava = new EnergizingLava();
    lava.resourceCount = 1;
    player.playedCards.push(lava);
    const card = new CEOsFavoriteProject();
    expect(card.canPlay(player)).is.true;
    player.defer(card.play(player));
    resolve(player);
    expect(lava.resourceCount).eq(2);
    expect(game).is.not.undefined;
  });

  it('Applied Science can add a radiation to a card with resources', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    const lava = new EnergizingLava();
    lava.resourceCount = 1;
    const applied = new AppliedScience();
    applied.resourceCount = 6;
    player.playedCards.push(lava, applied);
    applied.action(player);
    runAllActions(game);
    const or = cast(player.popWaitingFor(), OrOptions);
    const index = or.options.findIndex((o) => JSON.stringify(o.title).includes('ANY CARD'));
    player.defer(or);
    resolve(player, {or: [index], card: (cards) => cards.findIndex((c) => c.name === lava.name)});
    expect(lava.resourceCount).eq(2);
  });
});
