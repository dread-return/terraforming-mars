import {expect} from 'chai';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions, setOxygenLevel, setTemperature} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';
import {Phase} from '../../../src/common/Phase';
import {Payment} from '../../../src/common/inputs/Payment';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {AetherVial} from '../../../src/server/cards/epic/AetherVial';
import {CarbonNanosystemsEpic} from '../../../src/server/cards/epic/CarbonNanosystemsEpic';
import {CastleQueenMary} from '../../../src/server/cards/epic/CastleQueenMary';
import {CorellianEngineering} from '../../../src/server/cards/epic/CorellianEngineering';
import {DarwinEvolution} from '../../../src/server/cards/epic/DarwinEvolution';
import {GrotheIndustries} from '../../../src/server/cards/epic/GrotheIndustries';
import {HardHatConstruction} from '../../../src/server/cards/epic/HardHatConstruction';
import {PinpointRobotics} from '../../../src/server/cards/epic/PinpointRobotics';
import {ProfiCoin} from '../../../src/server/cards/epic/ProfiCoin';
import {SkyRanchers} from '../../../src/server/cards/epic/SkyRanchers';
import {SpacePenalColonies} from '../../../src/server/cards/epic/SpacePenalColonies';
import {SyndicatDesTravailleursMartiens} from '../../../src/server/cards/epic/SyndicatDesTravailleursMartiens';
import {Vanguard} from '../../../src/server/cards/epic/Vanguard';
import {WindMeyer} from '../../../src/server/cards/epic/WindMeyer';
import {XenosZoological} from '../../../src/server/cards/epic/XenosZoological';
import {PlanetForge} from '../../../src/server/cards/epic/PlanetForge';
import {ChooseCards} from '../../../src/server/deferredActions/ChooseCards';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 5', () => {
  it('Vanguard: steel pays its usual 2 M€ for Venus cards; spend 3 steel to draw a Venus card', () => {
    const vanguard = new Vanguard();
    const [game, player] = withCorp(vanguard, {venusNextExtension: true});
    expect(player.tags.count(Tag.BUILDING)).eq(1);
    const venus = fakeCard({name: 'v' as CardName, tags: [Tag.VENUS], cost: 9});
    const options = player.paymentOptionsForCard(venus);
    expect(options.steel).is.true;
    expect(player.payingAmount(Payment.of({steel: 3}), options)).eq(6);
    const model = new SelectProjectCardToPlay(player, [venus]).toModel(player);
    expect(model.cards[0].paymentOverrides).deep.eq({steel: true});
    player.steel = 2;
    expect(vanguard.canAct(player)).is.false;
    player.steel = 3;
    expect(vanguard.canAct(player)).is.true;
    const hand = player.cardsInHand.length;
    vanguard.action(player);
    runAllActions(game);
    expect(player.steel).eq(0);
    expect(player.cardsInHand.length).eq(hand + 1);
    expect(player.cardsInHand[player.cardsInHand.length - 1].tags).contains(Tag.VENUS);
  });

  it('Planet Forge: the client sees steel and titanium for Venus cards', () => {
    const [, player] = withCorp(new PlanetForge());
    const venus = fakeCard({name: 'v' as CardName, tags: [Tag.VENUS], cost: 9});
    const model = new SelectProjectCardToPlay(player, [venus]).toModel(player);
    expect(model.cards[0].paymentOverrides).deep.eq({steel: true, titanium: true});
  });

  it('Carbon Nanosystems (Epic): a graphene per science tag, including its own; worth 4 for space and city cards', () => {
    const carbon = new CarbonNanosystemsEpic();
    const [, player] = withCorp(carbon);
    expect(carbon.resourceCount).eq(1);
    player.playCard(fakeCard({name: 's' as CardName, tags: [Tag.SCIENCE, Tag.SCIENCE]}));
    expect(carbon.resourceCount).eq(3);
    const building = fakeCard({name: 'b' as CardName, tags: [Tag.BUILDING], cost: 10});
    expect(player.paymentOptionsForCard(building).graphene).is.false;
    const city = fakeCard({name: 'c' as CardName, tags: [Tag.CITY], cost: 10});
    const options = player.paymentOptionsForCard(city);
    expect(options.graphene).is.true;
    expect(player.getSpendable('graphene')).eq(3);
    expect(player.payingAmount(Payment.of({graphene: 2}), options)).eq(8);
    player.pay(Payment.of({graphene: 2}));
    expect(carbon.resourceCount).eq(1);
  });

  it('Castle Queen Mary: places a city for no one and takes the bonus', () => {
    const castle = new CastleQueenMary();
    const [game, player] = withCorp(castle);
    const select = cast(castle.action(player), SelectSpace);
    const space = select.spaces.find((s) => s.bonus.length > 0)!;
    select.cb(space);
    expect(space.tile).is.not.undefined;
    expect(space.player).not.eq(player);
    expect(game.board.getCities(player)).is.empty;
  });

  it('Corellian Engineering: a fighter cancels a resource loss', () => {
    const corellian = new CorellianEngineering();
    const [game, player, other] = withCorp(corellian);
    player.titanium = 1;
    corellian.action(player);
    runAllActions(game);
    expect(corellian.resourceCount).eq(1);
    player.plants = 5;
    player.stock.deduct(Resource.PLANTS, 3, {from: {player: other}});
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(player.plants).eq(5);
    expect(corellian.resourceCount).eq(0);
  });

  it('Darwin Evolution: animal tags count as science and science bends animal requirements', () => {
    const darwin = new DarwinEvolution();
    const [game, player] = withCorp(darwin);
    expect(darwin.resourceCount).eq(1);
    expect(player.tags.count(Tag.SCIENCE)).eq(1);
    // An animal card needing +2 °C, at -2 °C: 2 steps short, so 1 science is spent.
    setTemperature(game, -2);
    player.megaCredits = 50;
    const card = fakeCard({name: 'warm animal' as CardName, tags: [Tag.ANIMAL], requirements: [{temperature: 2}], cost: 1});
    expect(player.canPlay(card)).is.true;
    player.playCard(card);
    // 1 spent, then 1 gained for the animal tag.
    expect(darwin.resourceCount).eq(1);
    setTemperature(game, -10);
    expect(player.canPlay(card)).is.false;
  });

  it('Grothe Industries: a production raise as 1st action allows a paid one as 2nd', () => {
    const grothe = new GrotheIndustries();
    const [game, player] = withCorp(grothe);
    player.megaCredits = 10;
    player.actionsTakenThisRound = 0;
    player.production.add(Resource.PLANTS, 1);
    player.actionsTakenThisRound = 1;
    player.actionsTakenThisGame++;
    expect(grothe.canAct(player)).is.true;
    const options = cast(grothe.action(player), OrOptions);
    expect(options.options).has.length(5);
    options.options[0].cb();
    runAllActions(game);
    expect(player.production.megacredits).eq(1);
    expect(player.megaCredits).eq(7);
  });

  it('Hard Hat Construction: workers from tiles, spent for 10 M€ off tile cards', () => {
    const hardHat = new HardHatConstruction();
    const [, player] = withCorp(hardHat);
    hardHat.resourceCount = 2;
    const city = fakeCard({name: 'c' as CardName, cost: 25, behavior: {city: {}}});
    expect(player.getCardCost(city)).eq(5);
    hardHat.onCardPlayed(player, city);
    expect(hardHat.resourceCount).eq(0);
  });

  it('Pinpoint Robotics: cards that raise and lower production give +1', () => {
    const pinpoint = new PinpointRobotics();
    const [game, player] = withCorp(pinpoint);
    pinpoint.onCardPlayed(player, fakeCard({name: 'x' as CardName, behavior: {production: {energy: -1, megacredits: 2}}}));
    runAllActions(game);
    cast(player.popWaitingFor(), SelectOption).cb(undefined);
    expect(player.production.megacredits).eq(1);
  });

  it('ProfiCoin: everyone may buy 2 cards; purchases pay it', () => {
    const proficoin = new ProfiCoin();
    const [game, player, other] = withCorp(proficoin);
    proficoin.initialAction(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    expect(select.cards).has.length(2);
    const mc = player.megaCredits;
    other.megaCredits = 10;
    other.defer(new ChooseCards(other, game.projectDeck.drawN(game, 1), {paying: true, keepMax: 1}).execute());
    runAllActions(game);
    cast(other.popWaitingFor(), SelectCard).cb([]);
    expect(player.megaCredits).eq(mc);
    EpicHooks.onCardsKept(other, 2, true);
    expect(player.megaCredits).eq(mc + 2);
    game.phase = Phase.RESEARCH;
    EpicHooks.onCardsKept(other, 3, true);
    EpicHooks.onResearchPhaseEnd(game);
    expect(player.megaCredits).eq(mc + 3);
  });

  it('Sky Ranchers: animal requirements are 4 steps easier', () => {
    const [game, player] = withCorp(new SkyRanchers());
    player.megaCredits = 50;
    const card = fakeCard({name: 'airy animal' as CardName, tags: [Tag.ANIMAL], requirements: [{oxygen: 13}], cost: 1});
    setOxygenLevel(game, 9);
    expect(player.canPlay(card)).is.true;
    setOxygenLevel(game, 8);
    expect(player.canPlay(card)).is.false;
  });

  it('Space Penal Colonies: prisoners from space tags fill tag requirements', () => {
    const penal = new SpacePenalColonies();
    const [, player] = withCorp(penal);
    expect(penal.resourceCount).eq(1);
    const card = fakeCard({name: 'r' as CardName, requirements: [{tag: Tag.JOVIAN, count: 1}], cost: 0});
    expect(player.canPlay(card)).is.true;
    player.playCard(card);
    expect(penal.resourceCount).eq(0);
  });

  it('Syndicat des Travailleurs Martiens: others produce 5 less of the chosen resource', () => {
    const [game, player, other] = withCorp(new SyndicatDesTravailleursMartiens());
    EpicHooks.beforeProductionPhase(game);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[2].cb(); // titanium
    other.production.override({titanium: 7});
    other.finishProductionPhase();
    expect(other.titanium).eq(2);
    player.production.override({titanium: 3});
    player.finishProductionPhase();
    expect(player.titanium).eq(3);
  });

  it('Wind Meyer: options rotate', () => {
    const wind = new WindMeyer();
    const [, player] = withCorp(wind);
    player.playedCards.push(fakeCard({name: 'p' as CardName, tags: [Tag.POWER, Tag.POWER]}));
    const mc = player.megaCredits;
    const options = cast(wind.action(player), OrOptions);
    options.options[0].cb();
    expect(player.megaCredits).eq(mc + 3);
    const next = cast(wind.action(player), OrOptions);
    expect(next.options.map((o) => String(o.title))).not.include(String(options.options[0].title));
  });

  it('Xenos Zoological: an animal ignores all requirements of an animal card', () => {
    const xenos = new XenosZoological();
    const [, player] = withCorp(xenos);
    xenos.resourceCount = 1;
    player.megaCredits = 50;
    const animal = fakeCard({name: 'picky animal' as CardName, tags: [Tag.ANIMAL], requirements: [{oxygen: 13}], cost: 5});
    const venusAnimal = fakeCard({name: 'venus animal' as CardName, tags: [Tag.ANIMAL, Tag.VENUS], requirements: [{oxygen: 13}], cost: 5});
    player.cardsInHand.push(animal, venusAnimal);
    expect(player.canPlay(animal)).is.false;
    expect(xenos.canAct(player)).is.true;
    const select = cast(xenos.action(player), SelectProjectCardToPlay);
    expect(select.cards).deep.eq([animal]);
    expect(xenos.resourceCount).eq(0);
  });

  it('Aether Vial: plays a card costing exactly the M€ stored, for free', () => {
    const vial = new AetherVial();
    const [, player] = withCorp(vial);
    vial.data.stored = 7;
    const card = fakeCard({name: 'seven' as CardName, cost: 7, type: CardType.AUTOMATED});
    player.cardsInHand.push(card);
    player.megaCredits = 0;
    expect(vial.canAct(player)).is.true;
    cast(vial.action(player), SelectProjectCardToPlay);
    expect(player.getCardCost(card)).eq(0);
  });
});
