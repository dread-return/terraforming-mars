import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, addOcean, fakeCard, runAllActions, setTemperature} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {Tag} from '../../../src/common/cards/Tag';
import {CardResource} from '../../../src/common/CardResource';
import {TileType} from '../../../src/common/TileType';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {Board} from '../../../src/server/boards/Board';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {PatentTheft} from '../../../src/server/cards/idesofmars/PatentTheft';
import {IndustrialSpy} from '../../../src/server/cards/idesofmars/IndustrialSpy';
import {FloatingBaseOnSaturn} from '../../../src/server/cards/idesofmars/FloatingBaseOnSaturn';
import {TargetedResearch} from '../../../src/server/cards/idesofmars/TargetedResearch';
import {FlyingCorsairs} from '../../../src/server/cards/idesofmars/FlyingCorsairs';
import {AirTransportCompany} from '../../../src/server/cards/idesofmars/AirTransportCompany';
import {UniversalFighters} from '../../../src/server/cards/idesofmars/UniversalFighters';
import {MiningTheBelt} from '../../../src/server/cards/idesofmars/MiningTheBelt';
import {Takeover} from '../../../src/server/cards/idesofmars/Takeover';
import {InVivoTesting} from '../../../src/server/cards/idesofmars/InVivoTesting';
import {InvakCity} from '../../../src/server/cards/idesofmars/InvakCity';
import {Troglobites} from '../../../src/server/cards/idesofmars/Troglobites';
import {Amphibians} from '../../../src/server/cards/idesofmars/Amphibians';
import {WaterCleaningBacteria} from '../../../src/server/cards/idesofmars/WaterCleaningBacteria';
import {NaturalGrowthCatalyst} from '../../../src/server/cards/idesofmars/NaturalGrowthCatalyst';
import {GreatLeapForward} from '../../../src/server/cards/idesofmars/GreatLeapForward';
import {Reptiles} from '../../../src/server/cards/idesofmars/Reptiles';
import {SmallDeposit} from '../../../src/server/cards/idesofmars/SmallDeposit';

describe('Ides of Mars interaction cards', () => {
  it('Patent Theft: use an opponent\'s action and gain loot', () => {
    const card = new PatentTheft();
    const [game, player, opponent] = testGame(2);
    expect(card.canAct(player)).is.false;
    const deposit = new SmallDeposit();
    opponent.playedCards.push(deposit);
    deposit.resourceCount = 2;
    expect(card.canAct(player)).is.true;
    const select = cast(card.action(player), SelectCard);
    const options = cast(select.cb([deposit]), OrOptions);
    options.options[0].cb();
    expect(player.steel).eq(2);
    expect(card.resourceCount).eq(1);
    card.resourceCount = 4;
    expect(card.getVictoryPoints(player)).eq(-2);
    void game;
  });

  it('Industrial Spy: look at a hand', () => {
    const card = new IndustrialSpy();
    const [game, player, opponent] = testGame(2);
    opponent.cardsInHand.push(...game.projectDeck.drawN(game, 2));
    const select = cast(card.play(player), SelectCard);
    expect(select.cards).has.length(2);
    expect(select.config.max).eq(0);
  });

  it('Floating Base on Saturn: remove 2 floaters from a Jovian card', () => {
    const card = new FloatingBaseOnSaturn();
    const [, player] = testGame(2);
    const jovian = fakeCard({tags: [Tag.JOVIAN], resourceType: CardResource.FLOATER});
    player.playedCards.push(jovian);
    jovian.resourceCount = 1;
    expect(card.canPlay(player)).is.false;
    jovian.resourceCount = 3;
    expect(card.canPlay(player)).is.true;
    cast(card.play(player), SelectCard).cb([jovian]);
    expect(jovian.resourceCount).eq(1);
    expect(card.getVictoryPoints(player)).eq(4);
  });

  it('Targeted Research: finds a card with the chosen tag', () => {
    const card = new TargetedResearch();
    const [game, player] = testGame(2);
    const before = game.projectDeck.drawPile.length;
    const options = cast(card.play(player), OrOptions);
    const science = options.options.findIndex((o) => o.title.toString().includes('science'));
    options.options[science].cb();
    expect(player.cardsInHand).has.length(1);
    expect(player.cardsInHand[0].tags).includes(Tag.SCIENCE);
    expect(game.projectDeck.drawPile.length).eq(before - 1);
  });

  it('Flying Corsairs: steal a floater, then remove 2', () => {
    const card = new FlyingCorsairs();
    const [game, player, opponent] = testGame(2);
    const mine = fakeCard({resourceType: CardResource.FLOATER});
    const theirs = fakeCard({resourceType: CardResource.FLOATER});
    player.playedCards.push(mine);
    opponent.playedCards.push(theirs);
    theirs.resourceCount = 4;
    const steal = cast(card.play(player), SelectCard);
    steal.cb([theirs]);
    expect(theirs.resourceCount).eq(3);
    expect(mine.resourceCount).eq(1);
    runAllActions(game);
    const remove = player.popWaitingFor();
    if (remove instanceof OrOptions) {
      remove.options[0].cb();
    } else if (remove instanceof SelectCard) {
      remove.cb([theirs]);
    }
    expect(theirs.resourceCount + mine.resourceCount).eq(2);
  });

  it('Air Transport Company: add 2 floaters and move up to 4', () => {
    const card = new AirTransportCompany();
    const [game, player] = testGame(2);
    const a = fakeCard({resourceType: CardResource.FLOATER});
    const b = fakeCard({resourceType: CardResource.FLOATER});
    player.playedCards.push(a, b);
    player.tagsForTest = {venus: 2};
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([a]);
    runAllActions(game);
    expect(a.resourceCount).eq(2);
    const source = cast(player.popWaitingFor(), SelectCard);
    const amount = cast(source.cb([a]), SelectAmount);
    const target = cast(amount.cb(2), SelectCard);
    target.cb([b]);
    expect(a.resourceCount).eq(0);
    expect(b.resourceCount).eq(2);
  });

  it('Universal Fighters: move a floater or fighter from any card', () => {
    const card = new UniversalFighters();
    const [game, player, opponent] = testGame(2);
    card.play(player);
    runAllActions(game);
    player.playedCards.push(card);
    expect(card.resourceCount).eq(2);
    const theirs = fakeCard({resourceType: CardResource.FLOATER});
    opponent.playedCards.push(theirs);
    theirs.resourceCount = 1;
    const select = cast(card.action(player), SelectCard);
    const add = cast(select.cb([theirs]), SelectCard);
    add.cb([card]);
    expect(theirs.resourceCount).eq(0);
    expect(card.resourceCount).eq(3);
  });

  it('Mining the Belt: discard building/space cards for production', () => {
    const card = new MiningTheBelt();
    const [, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    const discard = fakeCard({tags: [Tag.SPACE, Tag.BUILDING]});
    player.cardsInHand.push(card, discard);
    expect(card.canPlay(player)).is.true;
    cast(card.play(player), SelectCard).cb([discard]);
    expect(player.production.asUnits()).deep.include({steel: 1, titanium: 1});
    expect(player.cardsInHand.map((c) => c.name)).deep.eq([card.name]);
  });

  it('Takeover: play a second corporation for 25 M€ less', () => {
    const card = new Takeover();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    game.generation = 5;
    player.megaCredits = 35;
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard<ICorporationCard>);
    expect(select.cards).has.length(5);
    const corp = select.cards[0];
    select.cb([corp]);
    runAllActions(game);
    expect(player.tableau.has(corp.name)).is.true;
  });

  it('In-Vivo Testing: remove microbes or plants', () => {
    const card = new InVivoTesting();
    const [game, player, opponent] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.tagsForTest = {science: 1};
    expect(card.canPlay(player)).is.true;
    opponent.plants = 6;
    const microbes = fakeCard({resourceType: CardResource.MICROBE});
    opponent.playedCards.push(microbes);
    microbes.resourceCount = 3;
    card.play(player);
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    expect(options.options).has.length(2);
    options.options[1].cb();
    runAllActions(game);
    const input = player.popWaitingFor();
    if (input instanceof OrOptions) {
      input.options[0].cb();
    }
    expect(opponent.plants).eq(1);
    expect(microbes.resourceCount).eq(3);
    expect(card.getVictoryPoints(player)).eq(-1);
  });

  it('Invak City: replaces a greenery and counts as city and greenery', () => {
    const card = new InvakCity();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    const greenery = addGreenery(player);
    player.production.override({energy: 1});
    expect(card.canPlay(player)).is.true;
    cast(card.play(player), SelectSpace).cb(greenery);
    runAllActions(game);
    expect(greenery.tile?.tileType).eq(TileType.INVAK_CITY);
    expect(Board.isCitySpace(greenery)).is.true;
    expect(Board.isGreenerySpace(greenery)).is.true;
    expect(player.production.megacredits).eq(3);
  });

  it('Troglobites: animal per special tile you place', () => {
    const troglobites = new Troglobites();
    const [game, player] = testGame(2);
    player.playedCards.push(troglobites);
    const greenery = addGreenery(player);
    expect(troglobites.resourceCount).eq(0);
    player.production.override({energy: 1});
    cast(new InvakCity().play(player), SelectSpace).cb(greenery);
    runAllActions(game);
    expect(troglobites.resourceCount).eq(1);
    troglobites.resourceCount = 8;
    expect(troglobites.getVictoryPoints(player)).eq(6);
  });

  it('Amphibians and Water Cleaning Bacteria react to oceans', () => {
    const amphibians = new Amphibians();
    const bacteria = new WaterCleaningBacteria();
    const [game, player, opponent] = testGame(2);
    expect(amphibians.canPlay(player)).is.false;
    setTemperature(game, -12);
    expect(amphibians.canPlay(player)).is.true;
    player.playedCards.push(amphibians, bacteria);
    addOcean(player);
    expect(amphibians.resourceCount).eq(1);
    expect(bacteria.resourceCount).eq(3);
    addOcean(opponent);
    expect(amphibians.resourceCount).eq(1);
    expect(bacteria.resourceCount).eq(6);
    expect(bacteria.canAct(player)).is.false;
    bacteria.resourceCount = 8;
    expect(bacteria.canAct(player)).is.true;
    bacteria.action(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    expect(bacteria.resourceCount).eq(3);
  });

  it('Natural Growth Catalyst: two greeneries', () => {
    const card = new NaturalGrowthCatalyst();
    const [game, player] = testGame(2);
    card.play(player);
    runAllActions(game);
    for (let i = 0; i < 2; i++) {
      const select = cast(player.popWaitingFor(), SelectSpace);
      select.cb(select.spaces[0]);
      runAllActions(game);
    }
    expect(game.getOxygenLevel()).eq(2);
  });

  it('Great Leap Forward: requires the chairman', () => {
    const card = new GreatLeapForward();
    const [game, player] = testGame(2, {turmoilExtension: true});
    expect(card.canPlay(player)).is.false;
    Turmoil.getTurmoil(game).chairman = player;
    expect(card.canPlay(player)).is.true;
    void PartyName.GREENS;
  });

  it('Reptiles VP', () => {
    const card = new Reptiles();
    const [, player] = testGame(2);
    card.resourceCount = 3;
    expect(card.getVictoryPoints(player)).eq(3);
    void SelectOption;
  });
});
