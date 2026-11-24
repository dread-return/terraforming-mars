import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {CardType} from '../../../src/common/cards/CardType';
import {Tag} from '../../../src/common/cards/Tag';
import {CardResource} from '../../../src/common/CardResource';
import {Phase} from '../../../src/common/Phase';
import {Payment} from '../../../src/common/inputs/Payment';
import {TileType} from '../../../src/common/TileType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectPayment} from '../../../src/server/inputs/SelectPayment';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';
import {SelectPaymentDeferred} from '../../../src/server/deferredActions/SelectPaymentDeferred';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {LeMartian} from '../../../src/server/cards/epic/LeMartian';
import {OmniDroneLabs} from '../../../src/server/cards/epic/OmniDroneLabs';
import {PegasusGroup} from '../../../src/server/cards/epic/PegasusGroup';
import {StellarRobotics} from '../../../src/server/cards/epic/StellarRobotics';
import {Technonauts} from '../../../src/server/cards/epic/Technonauts';
import {Xanthum} from '../../../src/server/cards/epic/Xanthum';
import {Oceanus} from '../../../src/server/cards/epic/Oceanus';
import {SagaBioengineering} from '../../../src/server/cards/epic/SagaBioengineering';
import {Microfac} from '../../../src/server/cards/epic/Microfac';
import {MilkySkyway} from '../../../src/server/cards/epic/MilkySkyway';
import {PowerPlantStandardProject} from '../../../src/server/cards/base/standardProjects/PowerPlantStandardProject';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 7 (new ways to pay)', () => {
  it('Pegasus Group: space tags add science, which pays 2 M€ each for space and science cards', () => {
    const corp = new PegasusGroup();
    const [, player] = withCorp(corp);
    // Its own space tag counts.
    expect(corp.resourceCount).eq(1);
    corp.onCardPlayed(player, fakeCard({tags: [Tag.SPACE, Tag.SPACE]}));
    expect(corp.resourceCount).eq(3);

    const card = fakeCard({name: 'probe' as CardName, tags: [Tag.SCIENCE], cost: 10});
    const options = player.paymentOptionsForCard(card);
    expect(options.epicResources).is.true;
    expect(options.epicValue).eq(2);
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.EARTH]})).epicResources).is.false;

    player.megaCredits = 4;
    player.cardsInHand.push(card);
    expect(player.canPlay(card)).is.true;
    // The client is told about the new payment row.
    const model = new SelectProjectCardToPlay(player, [card]).toModel(player);
    expect(model.cards[0].paymentOverrides).deep.eq({epicResources: true, epicValue: 2});
    expect(model.epicResources).eq(3);
    expect(model.epicResourceType).eq(CardResource.SCIENCE);

    player.checkPaymentAndPlayCard(card, Payment.of({megacredits: 4, epicResources: 3}));
    expect(corp.resourceCount).eq(0);
    expect(player.megaCredits).eq(0);
    expect(() => player.checkPaymentAndPlayCard(card, Payment.of({epicResources: 1}))).to.throw();
  });

  it('Stellar Robotics: steel and energy make robots, worth 5 M€ for automated cards', () => {
    const corp = new StellarRobotics();
    const [, player] = withCorp(corp);
    expect(player.production.steel).eq(1);
    expect(corp.resourceCount).eq(1);
    expect(corp.canAct(player)).is.false;
    player.steel = 1;
    player.energy = 1;
    corp.action(player);
    expect(corp.resourceCount).eq(2);
    expect(player.steel + player.energy).eq(0);

    const automated = fakeCard({type: CardType.AUTOMATED, cost: 10});
    expect(player.payingAmount(Payment.of({epicResources: 2}), player.paymentOptionsForCard(automated))).eq(10);
    expect(player.paymentOptionsForCard(fakeCard({type: CardType.ACTIVE})).epicResources).is.false;
  });

  it('Technonauts: robots pay 6 M€ for active cards and for card actions', () => {
    const corp = new Technonauts();
    const [game, player] = withCorp(corp);
    expect(corp.resourceCount).eq(3);
    expect(player.paymentOptionsForCard(fakeCard({type: CardType.ACTIVE})).epicValue).eq(6);

    player.megaCredits = 10;
    // Paying for a card action: robots are offered.
    EpicHooks.onCardAction(player, fakeCard({type: CardType.ACTIVE}));
    let paid: Payment | undefined;
    const select = cast(new SelectPaymentDeferred(player, 6).andThen((p) => paid = p).execute(), SelectPayment);
    expect(select.paymentOptions.epicResources).is.true;
    expect(select.toModel(player).epicResources).eq(3);
    select.process({type: 'payment', payment: Payment.of({epicResources: 1})}, player);
    expect(paid?.epicResources).eq(1);
    expect(corp.resourceCount).eq(2);

    // Once the next action starts, payments are M€ again.
    EpicHooks.onTakeAction(player);
    expect(new SelectPaymentDeferred(player, 6).execute()).is.undefined;
    expect(player.megaCredits).eq(4);
    expect(game).is.not.undefined;
  });

  it('Xanthum: X steel and X titanium become X alloy, worth 5 M€ for space and building cards', () => {
    const corp = new Xanthum();
    const [, player] = withCorp(corp);
    player.steel = 3;
    player.titanium = 2;
    const amount = cast(corp.action(player), SelectAmount);
    expect(amount.max).eq(2);
    amount.cb(2);
    expect(corp.resourceCount).eq(2);
    expect(player.steel).eq(1);
    expect(player.titanium).eq(0);
    const building = fakeCard({tags: [Tag.BUILDING]});
    expect(player.paymentOptionsForCard(building).epicValue).eq(5);
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.PLANT]})).epicResources).is.false;
  });

  it('Oceanus, Saga Bioengineering: their resources pay 3 M€ for Jovian / animal cards', () => {
    const oceanus = new Oceanus();
    const [, player] = withCorp(oceanus);
    oceanus.resourceCount = 2;
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.JOVIAN]})).epicValue).eq(3);
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.VENUS]})).epicResources).is.false;

    const saga = new SagaBioengineering();
    const [game, sagaPlayer] = withCorp(saga);
    expect(game.getOxygenLevel()).eq(2);
    saga.resourceCount = 1;
    expect(sagaPlayer.paymentOptionsForCard(fakeCard({tags: [Tag.ANIMAL]})).epicValue).eq(3);
  });

  it('Microfac: microbes pay 3 M€ each for standard projects', () => {
    const corp = new Microfac();
    const [, player] = withCorp(corp);
    corp.resourceCount = 2;
    player.megaCredits = 5;
    const powerPlant = new PowerPlantStandardProject();
    expect(powerPlant.canAct(player)).is.true;
    const select = new SelectStandardProjectToPlay(player, [powerPlant]);
    expect(select.paymentRulesFor(powerPlant).canPayWith).deep.include({epicResources: true, epicValue: 3});
    expect(select.toModel(player).cards[0].standardProjectCanPayWith).deep.include({epicResources: true, epicValue: 3});
    select.process({type: 'projectCard', card: powerPlant.name, payment: Payment.of({megacredits: 5, epicResources: 2})}, player);
    runAllActions(player.game);
    expect(corp.resourceCount).eq(0);
    expect(player.production.energy).eq(1);
  });

  it('OmniDrone Labs: any science tag adds an animal; plants and animals pay 2 M€ for science cards', () => {
    const corp = new OmniDroneLabs();
    const [, player, other] = withCorp(corp);
    // Its own science tag counts (including this).
    expect(corp.resourceCount).eq(1);
    corp.onCardPlayedByAnyPlayer(player, fakeCard({tags: [Tag.SCIENCE]}));
    expect(corp.resourceCount).eq(2);
    expect(other).is.not.undefined;

    const science = fakeCard({tags: [Tag.SCIENCE], cost: 8});
    const options = player.paymentOptionsForCard(science);
    expect(options.plants).is.true;
    expect(options.plantsValue).eq(2);
    expect(player.payingAmount(Payment.of({plants: 2, epicResources: 2}), options)).eq(8);
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.EARTH]})).plants).is.false;
  });

  it('Milky Skyway: energy pays 2 M€ for city cards; VP for cities in the largest group', () => {
    const corp = new MilkySkyway();
    const [game, player] = withCorp(corp);
    const city = fakeCard({tags: [Tag.CITY], cost: 10});
    const options = player.paymentOptionsForCard(city);
    expect(options.energy).is.true;
    expect(player.payingAmount(Payment.of({energy: 5}), options)).eq(10);
    expect(player.paymentOptionsForCard(fakeCard({tags: [Tag.EARTH]})).energy).is.false;

    // Two cities next to each other (one group), and one far away.
    const spaces = game.board.getAvailableSpacesOnLand(player);
    const first = spaces[0];
    const next = game.board.getAdjacentSpaces(first).find((s) => spaces.includes(s))!;
    game.simpleAddTile(player, first, {tileType: TileType.CITY});
    game.simpleAddTile(player, next, {tileType: TileType.CITY});
    const far = spaces.find((s) => !game.board.getAdjacentSpaces(first).includes(s) && !game.board.getAdjacentSpaces(next).includes(s) && s !== first && s !== next)!;
    game.simpleAddTile(player, far, {tileType: TileType.CITY});
    expect(corp.getVictoryPoints(player)).eq(2);
  });

  it('Le Martian: plants convert to 2 M€ and animals to 3 M€ for free', () => {
    const [, player] = withCorp(new LeMartian());
    expect(player.plants).eq(2);
    const options = cast(EpicHooks.freeActionOption(player), OrOptions);
    const amount = cast(options.options[0].cb(undefined), SelectAmount);
    const before = player.megaCredits;
    amount.cb(2);
    expect(player.plants).eq(0);
    expect(player.megaCredits).eq(before + 4);
  });
});
