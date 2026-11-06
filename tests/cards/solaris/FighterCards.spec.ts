import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {fakeCard, runAllActions, setOxygenLevel} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Flagship} from '../../../src/server/cards/solaris/Flagship';
import {AceVeteranSquad} from '../../../src/server/cards/solaris/AceVeteranSquad';
import {GalaxyDefenders} from '../../../src/server/cards/solaris/GalaxyDefenders';
import {Mothership} from '../../../src/server/cards/solaris/Mothership';
import {HypersonicFighters} from '../../../src/server/cards/solaris/HypersonicFighters';
import {ShieldingDrones} from '../../../src/server/cards/solaris/ShieldingDrones';
import {SpaceTelescope} from '../../../src/server/cards/solaris/SpaceTelescope';

describe('Solaris fighter cards', () => {
  it('Flagship: needs titanium production, 1 VP per fighter', () => {
    const card = new Flagship();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.production.add('titanium', 1);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    expect(card.resourceCount).eq(1);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Ace Veteran Squad: 2 fighters with 5 space tags', () => {
    const card = new AceVeteranSquad();
    const [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    card.action(player);
    expect(card.resourceCount).eq(1);
    for (let i = 0; i < 4; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
    }
    card.action(player);
    expect(card.resourceCount).eq(3);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Galaxy Defenders: M€ and a fighter per Jovian tag, including itself', () => {
    const card = new GalaxyDefenders();
    const [/* game */, player] = testGame(2);
    player.playCard(card);
    expect(card.resourceCount).eq(1);
    expect(player.megaCredits).eq(1);
    player.playCard(fakeCard({tags: [Tag.JOVIAN, Tag.JOVIAN]}));
    expect(card.resourceCount).eq(3);
    expect(player.megaCredits).eq(3);
    expect(card.getVictoryPoints(player)).eq(3);
  });

  it('Mothership: 1 energy adds a fighter to up to 2 cards', () => {
    const card = new Mothership();
    const flagship = new Flagship();
    const [/* game */, player] = testGame(2);
    for (let i = 0; i < 3; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
    }
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card, flagship);
    expect(card.canAct(player)).is.false;
    player.energy = 1;
    expect(card.canAct(player)).is.true;
    const selectCard = cast(card.action(player), SelectCard);
    selectCard.cb([card, flagship]);
    expect(player.energy).eq(0);
    expect(card.resourceCount).eq(1);
    expect(flagship.resourceCount).eq(1);
  });

  it('Hypersonic Fighters: 1 M€ / steel / titanium buys 1 / 2 / 3 fighters; 1 VP per 4', () => {
    const card = new HypersonicFighters();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 2);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(card.canAct(player)).is.false;
    player.titanium = 1;
    player.steel = 1;
    const orOptions = cast(card.action(player), OrOptions);
    expect(orOptions.options).has.length(2);
    orOptions.options[1].cb();
    expect(player.titanium).eq(0);
    expect(card.resourceCount).eq(3);
    card.action(player);
    expect(player.steel).eq(0);
    expect(card.resourceCount).eq(5);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Shielding Drones: a fighter per space, building or science tag, not its own', () => {
    const card = new ShieldingDrones();
    const [/* game */, player] = testGame(2);
    player.playCard(card);
    expect(card.resourceCount).eq(0);
    player.playCard(fakeCard({tags: [Tag.SPACE, Tag.BUILDING]}));
    player.playCard(fakeCard({tags: [Tag.SCIENCE, Tag.PLANT]}));
    expect(card.resourceCount).eq(3);
  });

  it('Space Telescope: data when any player plays a space event', () => {
    const card = new SpaceTelescope();
    const [/* game */, player, player2] = testGame(2);
    player.playedCards.push(card);
    player2.playCard(fakeCard({type: CardType.EVENT, tags: [Tag.SPACE, Tag.EVENT]}));
    player.playCard(fakeCard({type: CardType.EVENT, tags: [Tag.SPACE, Tag.EVENT]}));
    player.playCard(fakeCard({tags: [Tag.SPACE]}));
    expect(card.resourceCount).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });
});
