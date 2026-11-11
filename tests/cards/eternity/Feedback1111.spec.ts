import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addCity, runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {CardResource} from '../../../src/common/CardResource';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {Server} from '../../../src/server/models/ServerModel';
import {Board} from '../../../src/server/boards/Board';
import {Birds} from '../../../src/server/cards/base/Birds';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {AICentral} from '../../../src/server/cards/base/AICentral';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {Biofuels} from '../../../src/server/cards/prelude/Biofuels';
import {Donation} from '../../../src/server/cards/prelude/Donation';
import {BlackHoleProbe} from '../../../src/server/cards/eternity/BlackHoleProbe';
import {UnsanctionedSalvage} from '../../../src/server/cards/eternity/UnsanctionedSalvage';
import {AcquisitionTarget} from '../../../src/server/cards/eternity/AcquisitionTarget';
import {MeticulousResearch} from '../../../src/server/cards/eternity/MeticulousResearch';
import {DomeValley} from '../../../src/server/cards/eternity/DomeValley';
import {Parranda} from '../../../src/server/cards/eternity/Parranda';
import {OIS} from '../../../src/server/cards/eternity/OIS';
import {Jovicorp} from '../../../src/server/cards/eternity/Jovicorp';
import {TiceEcologicalLab} from '../../../src/server/cards/eternity/TiceEcologicalLab';
import {SteelFrictionProducers} from '../../../src/server/cards/eternity/SteelFrictionProducers';
import {ViralAmoeboid} from '../../../src/server/cards/eternity/ViralAmoeboid';
import {JellyfishFarms} from '../../../src/server/cards/eternity/JellyfishFarms';
import {Settlement} from '../../../src/server/cards/eternity/Settlement';
import {ColonizationProject} from '../../../src/server/cards/eternity/ColonizationProject';
import {DeepSpaceExploration} from '../../../src/server/cards/eternity/DeepSpaceExploration';
import {MeteorTheft} from '../../../src/server/cards/eternity/MeteorTheft';
import {SmallCheats} from '../../../src/server/cards/eternity/SmallCheats';
import {HeatSynthesizingMicroCatalyst} from '../../../src/server/cards/eternity/HeatSynthesizingMicroCatalyst';
import {DeepMachineLearningAlgorithms} from '../../../src/server/cards/eternity/DeepMachineLearningAlgorithms';
import {ProjectWhammy} from '../../../src/server/cards/eternity/ProjectWhammy';

describe('Eternity changes from the 2026-11-11 review', () => {
  let game: IGame;
  let player: TestPlayer;
  let other: TestPlayer;

  beforeEach(() => {
    [game, player, other] = testGame(2, {eternityExpansion: true, preludeExtension: true, venusNextExtension: true});
  });

  it('removed cards are gone', () => {
    expect((CardName as Record<string, string>).WRENIS_PINKLE).is.undefined;
    expect((CardName as Record<string, string>).TERRAFORMING_CONTROL_STATION_E).is.undefined;
  });

  it('Black Hole Probe: reveals 3 from the shuffled discard pile, keeps 1', () => {
    const probe = new BlackHoleProbe();
    player.playedCards.push(probe);
    game.projectDeck.discardPile.push(new Birds(), new Tardigrades(), new AICentral(), new Dirigibles(), new Biofuels() as never);
    player.megaCredits = 6;
    const hand = player.cardsInHand.length;
    expect(probe.canAct(player)).is.true;
    probe.action(player);
    runAllActions(game);
    const keep = cast(player.popWaitingFor(), SelectCard);
    expect(keep.cards).has.length(3);
    keep.cb([keep.cards[0]]);
    expect(player.cardsInHand).has.length(hand + 1);
    expect(game.projectDeck.discardPile).has.length(4);
    expect(probe.resourceCount).eq(1);
    expect(player.megaCredits).eq(0);
  });

  it('Unsanctioned Salvage: Junk Ventures draw, no VP penalty', () => {
    const card = new UnsanctionedSalvage();
    expect(card.victoryPoints).is.undefined;
    game.projectDeck.discardPile.push(new Birds(), new Tardigrades());
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    const keep = cast(player.popWaitingFor(), SelectCard);
    expect(keep.cards).has.length(2);
    keep.cb([keep.cards[1]]);
    expect(player.cardsInHand.map((c) => c.name)).includes(keep.cards[1].name);
  });

  it('Acquisition Target: 5 corporations drawn, swapping is optional', () => {
    const card = new AcquisitionTarget();
    const before = game.corporationDeck.drawPile.length;
    const corp = player.playedCards.corporations()[0];
    const mc = player.megaCredits;
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    expect(select.cards).has.length(5);
    expect(select.config.min).eq(0);
    select.cb([]);
    expect(game.corporationDeck.drawPile.length).eq(before - 5);
    expect(player.playedCards.corporations()[0]).eq(corp);
    expect(player.megaCredits).eq(mc + 5);
  });

  it('Meticulous Research: reveals 10 preludes and offers no double preludes', () => {
    const deck = game.preludeDeck;
    deck.drawPile.push(new DomeValley(), new Biofuels(), new Donation());
    player.megaCredits = 10;
    new MeticulousResearch().play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    const names = select.cards.map((c) => c.name);
    expect(names).not.includes(CardName.DOME_VALLEY);
    expect(names).includes(CardName.BIOFUELS);
    expect(names.length).lte(10);
    expect(player.megaCredits).eq(4);
  });

  it('Parranda: the city goes next to a city, even if that breaks the normal rule', () => {
    const card = new Parranda();
    expect(card.canPlay(player)).is.false;
    const city = addCity(other);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    expect(select.spaces.length).gt(0);
    for (const s of select.spaces) {
      expect(game.board.getAdjacentSpaces(s).some((a) => Board.isCitySpace(a))).is.true;
    }
    expect(select.spaces.some((s) => game.board.getAdjacentSpaces(s).includes(city))).is.true;
  });

  it('O.I.S.: in the production phase, opponents reveal any number of cards (at least 1)', () => {
    const ois = new OIS();
    player.playCorporationCard(ois);
    runAllActions(game);
    other.cardsInHand = [new Birds(), new Tardigrades(), new AICentral()];
    ois.onProductionPhase(player);
    runAllActions(game);
    const select = cast(other.popWaitingFor(), SelectCard);
    expect(select.config.min).eq(1);
    expect(select.config.max).eq(3);
    select.cb([other.cardsInHand[0], other.cardsInHand[1]]);
    expect(ois.faceUpCards(other)).has.length(2);
  });

  it('O.I.S.: an opponent with nothing left to reveal loses 1 TR', () => {
    const ois = new OIS();
    player.playCorporationCard(ois);
    runAllActions(game);
    other.cardsInHand = [];
    const tr = other.terraformRating;
    ois.onProductionPhase(player);
    runAllActions(game);
    expect(other.terraformRating).eq(tr - 1);
  });

  it('Jovicorp: can steal a floater from any opponent card, Jovian or not', () => {
    const jovicorp = new Jovicorp();
    player.playCorporationCard(jovicorp);
    const theirs = new Dirigibles();
    other.playedCards.push(theirs);
    theirs.resourceCount = 2;
    const mine = new Dirigibles();
    player.playedCards.push(mine);
    const options = cast(jovicorp.action(player), OrOptions);
    const steal = options.options.find((o) => cast(o, SelectOption).title.toString().includes('floater'));
    expect(steal).is.not.undefined;
    const from = cast(steal!.cb(undefined), SelectCard);
    const to = cast(from.cb([theirs]), SelectCard);
    to.cb([mine]);
    expect(theirs.resourceCount).eq(1);
    expect(mine.resourceCount).eq(1);
  });

  it('Tice Ecological Lab: 3 M€ animal, 4 M€ two microbes, 5 M€ plant production, in that order', () => {
    player.megaCredits = 20;
    new TiceEcologicalLab().play(player);
    runAllActions(game);
    const first = cast(player.popWaitingFor(), OrOptions);
    expect(cast(first.options[0], SelectOption).title).contains('3 M€').and.contains('animal');
    first.options[1].cb(undefined);
    runAllActions(game);
    const second = cast(player.popWaitingFor(), OrOptions);
    expect(cast(second.options[0], SelectOption).title).contains('4 M€').and.contains('microbes');
    second.options[1].cb(undefined);
    runAllActions(game);
    const third = cast(player.popWaitingFor(), OrOptions);
    expect(cast(third.options[0], SelectOption).title).contains('5 M€').and.contains('plant production');
  });

  it('Steel Friction Producers: the TR option comes first', () => {
    player.megaCredits = 20;
    new SteelFrictionProducers().play(player);
    runAllActions(game);
    const first = cast(player.popWaitingFor(), OrOptions);
    expect(cast(first.options[0], SelectOption).title).contains('5 M€').and.contains('TR');
  });

  it('Viral Amoeboid enters with only the microbes from its own 2 tags', () => {
    const card = new ViralAmoeboid();
    player.playCard(card);
    runAllActions(game);
    expect(card.resourceCount).eq(2);
  });

  it('Jellyfish Farms marks its ocean for the board', () => {
    const card = new JellyfishFarms();
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    const marked = (Server as unknown as {jellyfishSpaces(g: IGame): Array<string>}).jellyfishSpaces(game);
    expect(marked).deep.eq([space.id]);
  });

  it('Settlement gives no M€; Colonization Project costs 8 M€', () => {
    const mc = player.megaCredits;
    new Settlement().play(player);
    runAllActions(game);
    expect(player.megaCredits).eq(mc);
    expect(new ColonizationProject().canPlay(player)).eq(player.canAfford(8));
  });

  it('Deep Space Exploration gives no titanium when played', () => {
    player.playCard(new DeepSpaceExploration());
    runAllActions(game);
    expect(player.titanium).eq(0);
  });

  it('Meteor Theft simply draws a card', () => {
    const hand = player.cardsInHand.length;
    new MeteorTheft().play(player);
    runAllActions(game);
    expect(player.cardsInHand).has.length(hand + 1);
  });

  it('Small Cheats: 2 cheat counters draw 1 card', () => {
    const card = new SmallCheats();
    card.play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb(undefined);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb(undefined);
    runAllActions(game);
    const hand = player.cardsInHand.length;
    cast(player.popWaitingFor(), OrOptions).options[0].cb(undefined);
    runAllActions(game);
    expect(player.cardsInHand).has.length(hand + 1);
    expect(card.resourceCount).eq(2);
  });

  it('Heat-Synthesizing Micro-Catalyst adds nothing when played', () => {
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    player.playCard(new HeatSynthesizingMicroCatalyst());
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;
    expect(dirigibles.resourceCount).eq(0);
  });

  it('cost and VP changes', () => {
    expect(new DeepMachineLearningAlgorithms().victoryPoints).eq(3);
    expect(new ProjectWhammy().cost).eq(90);
    expect(CardResource.FLOATER).is.not.undefined;
  });
});
