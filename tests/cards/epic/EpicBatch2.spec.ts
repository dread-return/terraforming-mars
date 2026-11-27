import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {addCity, addGreenery, addOcean, fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';
import {Phase} from '../../../src/common/Phase';
import {Units} from '../../../src/common/Units';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';
import {ChooseCards} from '../../../src/server/deferredActions/ChooseCards';
import {Board} from '../../../src/server/boards/Board';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {TradeWithEnergy} from '../../../src/server/player/Colonies';
import {Payment} from '../../../src/common/inputs/Payment';
import {CheapChispa} from '../../../src/server/cards/epic/CheapChispa';
import {Thermex} from '../../../src/server/cards/epic/Thermex';
import {OpportunisticConsortium} from '../../../src/server/cards/epic/OpportunisticConsortium';
import {AresSecurity} from '../../../src/server/cards/epic/AresSecurity';
import {OrbitalEye} from '../../../src/server/cards/epic/OrbitalEye';
import {AcquireUnlimited} from '../../../src/server/cards/epic/AcquireUnlimited';
import {Toyitsu} from '../../../src/server/cards/epic/Toyitsu';
import {AresUnion} from '../../../src/server/cards/epic/AresUnion';
import {NOJO} from '../../../src/server/cards/epic/NOJO';
import {TwinCitiesOfHelium} from '../../../src/server/cards/epic/TwinCitiesOfHelium';
import {ImperioSolarMarciano} from '../../../src/server/cards/epic/ImperioSolarMarciano';
import {DevWright} from '../../../src/server/cards/epic/DevWright';
import {LogosResearchAndDevelopment} from '../../../src/server/cards/epic/LogosResearchAndDevelopment';
import {LazarusLaboratories} from '../../../src/server/cards/epic/LazarusLaboratories';
import {ChaangFuelsInc} from '../../../src/server/cards/epic/ChaangFuelsInc';
import {SolarEnterprises} from '../../../src/server/cards/epic/SolarEnterprises';
import {AresTechnology} from '../../../src/server/cards/epic/AresTechnology';
import {Oasis} from '../../../src/server/cards/epic/Oasis';
import {CoeurlIndustries} from '../../../src/server/cards/epic/CoeurlIndustries';
import {TrueMarsFoundation} from '../../../src/server/cards/epic/TrueMarsFoundation';
import {Pathfinder} from '../../../src/server/cards/epic/Pathfinder';
import {SpartansSecurity} from '../../../src/server/cards/epic/SpartansSecurity';
import {TEO} from '../../../src/server/cards/epic/TEO';
import {EarthFirst} from '../../../src/server/cards/epic/EarthFirst';
import {Ouroboros} from '../../../src/server/cards/epic/Ouroboros';
import {PrincessLtd} from '../../../src/server/cards/epic/PrincessLtd';
import {Blizzcorp} from '../../../src/server/cards/epic/Blizzcorp';
import {Neptune} from '../../../src/server/cards/epic/Neptune';
import {NewTech} from '../../../src/server/cards/epic/NewTech';
import {MaraboutShiritori} from '../../../src/server/cards/epic/MaraboutShiritori';
import {AstraMechanika} from '../../../src/server/cards/epic/AstraMechanika';
import {Aria} from '../../../src/server/cards/epic/Aria';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 2', () => {
  it('Cheap Chispa: energy production decreases are 1 step smaller', () => {
    const [, player] = withCorp(new CheapChispa());
    player.production.override({energy: 3});
    player.production.add(Resource.ENERGY, -2);
    expect(player.production.energy).eq(2);
    player.production.add(Resource.ENERGY, -1);
    expect(player.production.energy).eq(2);
    expect(player.production.canAdjust(Units.of({energy: -3}))).is.true;
  });

  it('Thermex: losing energy production raises heat production', () => {
    const [, player] = withCorp(new Thermex());
    const heat = player.production.heat;
    player.production.add(Resource.ENERGY, -1);
    expect(player.production.heat).eq(heat + 1);
  });

  it('Opportunistic Consortium: gains what an opponent\'s production loses', () => {
    const [, player, other] = withCorp(new OpportunisticConsortium());
    other.production.override({steel: 3});
    other.production.add(Resource.STEEL, -2);
    expect(player.steel).eq(2);
  });

  it('Ares Security and Orbital Eye: react to a player stealing from another', () => {
    const [game, security, eye] = testGame(2);
    security.playCorporationCard(new AresSecurity());
    eye.playCorporationCard(new OrbitalEye());
    runAllActions(game);
    eye.stock.add(Resource.PLANTS, 5);
    eye.stock.steal(Resource.PLANTS, 2, security);
    expect(security.plants).eq(2 + 1);
    expect(eye.plants).eq(3 + 3);
  });

  it('Ares Security: negative card VP is cancelled', () => {
    const [, player] = withCorp(new AresSecurity());
    player.playedCards.push(fakeCard({name: 'neg' as CardName, victoryPoints: -2}));
    expect(player.getVictoryPoints().total).eq(player.terraformRating);
  });

  it('Acquire Unlimited: +1 when an opponent gains 2+ production during the action phase', () => {
    const [, player, other] = withCorp(new AcquireUnlimited());
    other.production.add(Resource.TITANIUM, 2);
    expect(player.production.titanium).eq(1);
    other.production.add(Resource.TITANIUM, 1);
    expect(player.production.titanium).eq(1);
    other.stock.add(Resource.HEAT, 3);
    expect(player.heat).eq(1);
  });

  it('Toyitsu: pay 5 M€ to raise a production 1 more step; Ares Union: raise a production already raised this generation', () => {
    const toyitsu = new Toyitsu();
    const [game, player] = withCorp(toyitsu);
    expect(player.megaCredits).eq(30);
    expect(player.tags.count(Tag.BUILDING)).eq(1);
    player.megaCredits = 10;
    player.production.add(Resource.PLANTS, 1);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);
    expect(player.production.plants).eq(2);
    expect(player.megaCredits).eq(5);
    // Its own extra step doesn't trigger it again.
    expect(player.popWaitingFor()).is.undefined;
    player.production.add(Resource.HEAT, 2);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb();
    runAllActions(game);
    expect(player.production.heat).eq(2);
    expect(player.megaCredits).eq(5);
    // Can't afford it: no question.
    player.megaCredits = 4;
    player.production.add(Resource.STEEL, 1);
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;

    const union = new AresUnion();
    const [, p2] = withCorp(union);
    expect(p2.steel).eq(4);
    p2.production.add(Resource.HEAT, 1);
    p2.production.add(Resource.ENERGY, 1);
    const options = cast(union.action(p2), OrOptions);
    options.options[1].cb();
    expect(p2.production.energy).eq(2);
  });

  it('NOJO: opponents pay 2 M€ more per Jovian tag, and NOJO receives it', () => {
    const [, player, other] = withCorp(new NOJO());
    const card = fakeCard({name: 'jovian' as CardName, tags: [Tag.JOVIAN], cost: 10});
    expect(other.getCardCost(card)).eq(12);
    expect(player.getCardCost(card)).eq(10);
    const before = player.megaCredits;
    other.playCard(card);
    expect(player.megaCredits).eq(before + 2);
  });

  it('Twin Cities of Helium: cannot play Earth tags; discounts science and VP cards', () => {
    const [, player] = withCorp(new TwinCitiesOfHelium());
    player.megaCredits = 100;
    const earth = fakeCard({name: 'earth' as CardName, tags: [Tag.EARTH], cost: 5});
    expect(player.canPlay(earth)).is.false;
    expect(player.getCardCost(fakeCard({name: 's' as CardName, tags: [Tag.SCIENCE], cost: 10}))).eq(7);
    expect(player.getCardCost(fakeCard({name: 'v' as CardName, victoryPoints: 1, cost: 10}))).eq(7);
    expect(player.getCardCost(fakeCard({name: 'n' as CardName, victoryPoints: -1, cost: 10}))).eq(10);
  });

  it('Imperio Solar Marciano: card costs depend on planetary tags', () => {
    const [, player] = withCorp(new ImperioSolarMarciano());
    expect(player.getCardCost(fakeCard({name: 'a' as CardName, tags: [Tag.BUILDING], cost: 10}))).eq(8);
    expect(player.getCardCost(fakeCard({name: 'b' as CardName, tags: [Tag.MARS], cost: 10}))).eq(10);
    expect(player.getCardCost(fakeCard({name: 'c' as CardName, tags: [Tag.JOVIAN], cost: 10}))).eq(14);
  });

  it('Dev Wright: 2 M€ per drawn card', () => {
    const [, player] = withCorp(new DevWright());
    const before = player.megaCredits;
    player.drawCard(2);
    runAllActions(player.game);
    expect(player.megaCredits).eq(before + 4);
  });

  it('Logos R&D: one research card is free', () => {
    const [game, player] = withCorp(new LogosResearchAndDevelopment());
    player.megaCredits = 3;
    const cards = game.projectDeck.drawN(game, 5);
    player.defer(new ChooseCards(player, cards, {paying: true, keepMax: 5, freeCards: 1}).execute());
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    expect(select.config.max).eq(2);
    select.cb(cards.slice(0, 2));
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(player.megaCredits).eq(0);
  });

  it('Lazarus Laboratories: keeps one discarded research card', () => {
    const [game, player] = withCorp(new LazarusLaboratories());
    const cards = game.projectDeck.drawN(game, 4);
    player.defer(new ChooseCards(player, cards, {paying: true, keepMax: 4, keepOneDiscardFree: true}).execute());
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([]);
    runAllActions(game);
    const keepOne = cast(player.popWaitingFor(), SelectCard);
    keepOne.cb([cards[2]]);
    expect(player.cardsInHand).deep.eq([cards[2]]);
  });

  it('Chaang Fuels Inc. and Solar Enterprises: trade income', () => {
    const [game, trader, chaang] = testGame(2, {coloniesExtension: true});
    chaang.playCorporationCard(new ChaangFuelsInc());
    trader.playCorporationCard(new SolarEnterprises());
    runAllActions(game);
    const colony = game.colonies[0];
    colony.trackPosition = 3;
    trader.energy = 3;
    const chaangEnergy = chaang.energy;
    const mc = trader.megaCredits;
    new TradeWithEnergy(trader).trade(colony);
    runAllActions(game);
    expect(chaang.energy).eq(chaangEnergy + 1);
    // Solar Enterprises: 1 M€ for any trade + 3 (track position 3, no colonies); the colony's own income may add more.
    expect(trader.megaCredits).gte(mc + 4);
  });

  it('Ares Technology: reorders the top 3 global events', () => {
    const [game, player] = withCorp(new AresTechnology(), {turmoilExtension: true});
    const deck = game.turmoil!.globalEventDealer.deck;
    const top = deck[deck.length - 1];
    EpicHooks.beforeTurmoilPhase(game);
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    expect(options.options).has.length(6);
    options.options[5].cb();
    expect(deck[deck.length - 1]).not.eq(top);
  });

  it('Oasis: may place greenery away from its tiles; isolated greenery raises M€ production', () => {
    const [game, player] = withCorp(new Oasis());
    addCity(player);
    const board = game.board;
    const spaces = board.getAvailableSpacesForGreenery(player);
    const isolated = spaces.find((s) => !board.getAdjacentSpaces(s).some((a) => Board.hasRealTile(a)));
    expect(isolated).is.not.undefined;
    const prod = player.production.megacredits;
    addGreenery(player, isolated!.id);
    expect(player.production.megacredits).eq(prod + 1);
  });

  it('Coeurl Industries: standard project accepts steel', () => {
    const coeurl = new CoeurlIndustries();
    const [game, player] = withCorp(coeurl);
    player.megaCredits = 0;
    player.steel = 20;
    expect(coeurl.canAct(player)).is.true;
    const city = game.standardProjects.find((sp) => sp.name === CardName.CITY_STANDARD_PROJECT)!;
    expect(city.canAct(player)).is.false;
    cast(coeurl.action(player), SelectStandardProjectToPlay);
    expect(city.canAct(player)).is.true;
    city.payAndExecute(player, Payment.of({steel: 13}));
    runAllActions(game);
    expect(coeurl.data.acting).is.false;
    expect(player.steel).eq(7);
  });

  it('True Mars Foundation: chosen tags cost 3 less for you, 1 less for others', () => {
    const tmf = new TrueMarsFoundation();
    const [, player, other] = withCorp(tmf);
    cast(tmf.action(player), OrOptions).options[1].cb(); // space / jovian
    const card = fakeCard({name: 'sp' as CardName, tags: [Tag.SPACE], cost: 10});
    expect(player.getCardCost(card)).eq(7);
    expect(other.getCardCost(card)).eq(9);
  });

  it('Pathfinder: first tile in a row raises TR', () => {
    const [game, player] = withCorp(new Pathfinder());
    const tr = player.terraformRating;
    const space = game.board.getAvailableSpacesOnLand(player)[0];
    addCity(player, space.id);
    expect(player.terraformRating).eq(tr + 1);
    const sameRow = game.board.getAvailableSpacesOnLand(player).find((s) => s.y === space.y && !game.board.getAdjacentSpaces(space).includes(s));
    if (sameRow !== undefined) {
      addCity(player, sameRow.id);
      expect(player.terraformRating).eq(tr + 1);
    }
  });

  it('Spartans Security: steals from neighbours', () => {
    const [game, player, other] = withCorp(new SpartansSecurity());
    const mine = addCity(player);
    const next = game.board.getAdjacentSpaces(mine).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    other.megaCredits = 5;
    const mc = player.megaCredits;
    addGreenery(other, next.id);
    expect(other.megaCredits).eq(3);
    expect(player.megaCredits).eq(mc + 2);
  });

  it('TEO: plays a card for 5 less, then flips it face down', () => {
    const teo = new TEO();
    const [game, player] = withCorp(teo);
    const card = fakeCard({name: 'blue' as CardName, type: CardType.ACTIVE, tags: [Tag.BUILDING], cost: 6});
    player.cardsInHand.push(card);
    player.megaCredits = 1;
    expect(teo.canAct(player)).is.true;
    teo.action(player);
    expect(player.getCardCost(card)).eq(1);
    player.playCard(card);
    runAllActions(game);
    expect(player.playedCards.has(card.name)).is.false;
    expect(teo.data.pending).is.false;
    expect(player.getCardCost(card)).eq(6);
  });

  it('Earth First: first card of the generation is cheaper per Earth tag', () => {
    const [game, player] = withCorp(new EarthFirst());
    const card = fakeCard({name: 'x' as CardName, cost: 10});
    expect(player.getCardCost(card)).eq(9);
    player.playCard(fakeCard({name: 'y' as CardName, cost: 0}));
    expect(player.getCardCost(card)).eq(10);
    game.generation++;
    expect(player.getCardCost(card)).eq(9);
  });

  it('Ouroboros: Earth tags pay 2 M€ and discount the next card', () => {
    const [, player, other] = withCorp(new Ouroboros());
    const mc = player.megaCredits;
    other.playCard(fakeCard({name: 'e1' as CardName, tags: [Tag.EARTH]}));
    expect(player.megaCredits).eq(mc + 2);
    player.playCard(fakeCard({name: 'e2' as CardName, tags: [Tag.EARTH]}));
    const card = fakeCard({name: 'x' as CardName, cost: 10});
    expect(player.getCardCost(card)).eq(7);
    player.playCard(fakeCard({name: 'y' as CardName}));
    expect(player.getCardCost(card)).eq(10);
  });

  it('Princess Ltd.: may swap a production loss for M€ production once per generation', () => {
    const [game, player] = withCorp(new PrincessLtd());
    player.production.override({megacredits: 3, plants: 2});
    player.production.add(Resource.PLANTS, -1);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(player.production.plants).eq(2);
    expect(player.production.megacredits).eq(2);
    player.production.add(Resource.PLANTS, -1);
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;
  });

  it('Blizzcorp: cheaper below 0°C, dearer above', () => {
    const [game, player] = withCorp(new Blizzcorp());
    const card = fakeCard({name: 'x' as CardName, cost: 10});
    expect(player.getCardCost(card)).eq(9);
    (game as any).temperature = 0;
    expect(player.getCardCost(card)).eq(12);
  });

  it('Neptune: own oceans give free markers, others\' cost 5 M€', () => {
    const neptune = new Neptune();
    const [game, player, other] = withCorp(neptune);
    addOcean(player);
    expect(neptune.data.markers).eq(1);
    player.megaCredits = 10;
    addOcean(other);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);
    expect(neptune.data.markers).eq(2);
    expect(player.megaCredits).eq(5);
    expect(neptune.getVictoryPoints()).eq(2);
  });

  it('New Tech: action only as the first action of the generation', () => {
    const newTech = new NewTech();
    const [game, player] = withCorp(newTech);
    player.megaCredits = 5;
    expect(newTech.canAct(player)).is.true;
    player.actionsTakenThisGame++;
    expect(newTech.canAct(player)).is.false;
    EpicHooks.onGenerationStart(game);
    expect(newTech.canAct(player)).is.true;
  });

  it('Marabout Shiritori: discount for sharing a tag with the last card played', () => {
    const [, player] = withCorp(new MaraboutShiritori());
    expect(player.cardsInHand).has.length(0);
    player.playCard(fakeCard({name: 'a' as CardName, tags: [Tag.PLANT]}));
    expect(player.getCardCost(fakeCard({name: 'b' as CardName, tags: [Tag.PLANT], cost: 10}))).eq(7);
    expect(player.getCardCost(fakeCard({name: 'c' as CardName, tags: [Tag.SPACE], cost: 10}))).eq(10);
  });

  it('Astra Mechanika: returns a played event to hand', () => {
    const astra = new AstraMechanika();
    const [, player] = withCorp(astra);
    const event = fakeCard({name: 'ev' as CardName, type: CardType.EVENT});
    player.playedCards.push(event);
    expect(astra.canAct(player)).is.true;
    cast(astra.action(player), SelectCard).cb([event]);
    expect(player.cardsInHand).deep.eq([event]);
    expect(player.production.energy).eq(0);
  });

  it('Aria: cities next to oceans raise M€ production', () => {
    const [, player, other] = withCorp(new Aria());
    const ocean = addOcean(player);
    const next = player.game.board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    const mine = player.production.megacredits;
    const theirs = other.production.megacredits;
    addCity(other, next.id);
    expect(player.production.megacredits).eq(mine + 1);
    expect(other.production.megacredits).eq(theirs + 1);
  });
});
