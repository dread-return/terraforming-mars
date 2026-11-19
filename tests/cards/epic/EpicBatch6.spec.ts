import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions, setOxygenLevel} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';
import {Phase} from '../../../src/common/Phase';
import {Payment} from '../../../src/common/inputs/Payment';
import {Units} from '../../../src/common/Units';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectResources} from '../../../src/server/inputs/SelectResources';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {DiscountConglomerate} from '../../../src/server/cards/epic/DiscountConglomerate';
import {FlexiChangeIndustry} from '../../../src/server/cards/epic/FlexiChangeIndustry';
import {JumpStartCorporation} from '../../../src/server/cards/epic/JumpStartCorporation';
import {ShortCutEnterprise} from '../../../src/server/cards/epic/ShortCutEnterprise';
import {StandardBusiness} from '../../../src/server/cards/epic/StandardBusiness';
import {StreamlineLogistics} from '../../../src/server/cards/epic/StreamlineLogistics';
import {TerraInvestFirm} from '../../../src/server/cards/epic/TerraInvestFirm';
import {TopUpOperation} from '../../../src/server/cards/epic/TopUpOperation';

function withCorp(corp: ICorporationCard, players: number = 2): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(players);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 6 (wild resources)', () => {
  it('start with extra M€ per other player', () => {
    const [, player] = withCorp(new TopUpOperation(), 3);
    expect(player.megaCredits).eq(48 + 2 * 2);
    const [, solo] = withCorp(new DiscountConglomerate(), 1);
    expect(solo.megaCredits).eq(42);
  });

  it('wild resources convert into any standard resources for free', () => {
    const corp = new StreamlineLogistics();
    const [, player] = withCorp(corp);
    expect(EpicHooks.freeActionOption(player)).is.undefined;
    corp.resourceCount = 3;
    const option = cast(EpicHooks.freeActionOption(player), OrOptions).options[0];
    const amount = cast(option.cb(undefined), SelectAmount);
    const resources = cast(amount.cb(2), SelectResources);
    expect(resources.count).eq(2);
    resources.cb(Units.of({steel: 1, heat: 1}));
    expect(player.steel).eq(1);
    expect(player.heat).eq(1);
    expect(corp.resourceCount).eq(1);
    expect(player.freeActionTaken).is.true;
  });

  it('Discount Conglomerate: lowered production adds wild; spend them for 3 M€ off a card', () => {
    const corp = new DiscountConglomerate();
    const [, player] = withCorp(corp);
    player.production.add(Resource.ENERGY, 2);
    player.production.add(Resource.ENERGY, -1);
    player.production.add(Resource.ENERGY, -1);
    expect(corp.resourceCount).eq(2);

    player.megaCredits = 4;
    const card = fakeCard({name: 'ten' as CardName, cost: 10, type: CardType.AUTOMATED});
    player.cardsInHand.push(card);
    expect(player.canPlay(card)).is.false;
    expect(corp.canAct(player)).is.true;
    // 1 wild only takes 3 M€ off, so both are needed.
    const select = cast(corp.action(player), SelectProjectCardToPlay);
    expect(select.cards).deep.eq([card]);
    expect(corp.resourceCount).eq(0);
    expect(player.getCardCost(card)).eq(4);
    select.payAndPlay(card, Payment.of({megacredits: 4}));
    expect(player.playedCards.has(card.name)).is.true;
    expect(player.getCardCost(card)).eq(10);
  });

  it('Flexi-Change Industry: cards with global requirements add wild; swap productions', () => {
    const corp = new FlexiChangeIndustry();
    const [, player] = withCorp(corp);
    // The two starting productions.
    const second = cast(cast(player.popWaitingFor(), OrOptions).options[1].cb(), OrOptions);
    second.options[1].cb();
    expect(player.production.steel).eq(2);

    corp.onCardPlayed(player, fakeCard({requirements: [{oxygen: 3}]}));
    corp.onCardPlayed(player, fakeCard({requirements: [{tag: Tag.SCIENCE}]}));
    expect(corp.resourceCount).eq(1);

    const lower = cast(corp.action(player), OrOptions);
    const steel = lower.options.find((o) => String(o.title).includes('steel'))!;
    const raise = cast(steel.cb(undefined), OrOptions);
    raise.options.find((o) => String(o.title).includes('titanium'))!.cb(undefined);
    expect(player.production.steel).eq(1);
    expect(player.production.titanium).eq(1);
    expect(corp.resourceCount).eq(0);
  });

  it('Jump-Start Corporation: 14 resources; raising parameters adds wild; bends global requirements', () => {
    const corp = new JumpStartCorporation();
    const [game, player] = withCorp(corp);
    const start = cast(player.popWaitingFor(), SelectResources);
    expect(start.count).eq(14);
    start.cb(Units.of({titanium: 14}));
    expect(player.titanium).eq(14);

    game.increaseOxygenLevel(player, 2);
    expect(corp.resourceCount).eq(2);

    setOxygenLevel(game, 2);
    const card = fakeCard({name: 'needs 4' as CardName, cost: 1, requirements: [{oxygen: 4}]});
    const farOff = fakeCard({name: 'needs 7' as CardName, cost: 1, requirements: [{oxygen: 7}]});
    player.cardsInHand.push(card, farOff);
    player.megaCredits = 10;
    expect(player.canPlay(card)).is.false;
    const select = cast(corp.action(player), SelectProjectCardToPlay);
    expect(select.cards).deep.eq([card]);
    select.payAndPlay(card, Payment.of({megacredits: 1}));
    expect(corp.resourceCount).eq(0);
    expect(player.canPlay(farOff)).is.false;
  });

  it('Short-Cut Enterprise: active cards add wild; wild fill missing tags', () => {
    const corp = new ShortCutEnterprise();
    const [, player] = withCorp(corp);
    corp.onCardPlayed(player, fakeCard({type: CardType.ACTIVE}));
    corp.onCardPlayed(player, fakeCard({type: CardType.EVENT}));
    expect(corp.resourceCount).eq(1);

    player.tagsForTest = {science: 1};
    const card = fakeCard({name: 'two science' as CardName, type: CardType.AUTOMATED, cost: 1, requirements: [{tag: Tag.SCIENCE, count: 2}]});
    player.cardsInHand.push(card);
    player.megaCredits = 10;
    expect(player.canPlay(card)).is.false;
    const select = cast(corp.action(player), SelectProjectCardToPlay);
    expect(select.cards).deep.eq([card]);
    select.payAndPlay(card, Payment.of({megacredits: 1}));
    expect(corp.resourceCount).eq(0);
  });

  it('Standard Business: tiles add wild; spend them for 3 M€ off a standard project', () => {
    const corp = new StandardBusiness();
    const [game, player] = withCorp(corp);
    const space = game.board.getAvailableSpacesForCity(player)[0];
    game.addCity(player, space);
    expect(corp.resourceCount).eq(1);

    corp.resourceCount = 2;
    player.megaCredits = 5;
    // The power plant project costs 11: needs both wild resources.
    const select = cast(corp.action(player), SelectStandardProjectToPlay);
    expect(select.cards.map((c) => c.name)).contains(CardName.POWER_PLANT_STANDARD_PROJECT);
    expect(select.cards.map((c) => c.name)).not.contains(CardName.CITY_STANDARD_PROJECT);
    expect(select.cards.map((c) => c.name)).not.contains(CardName.SELL_PATENTS_STANDARD_PROJECT);
    expect(corp.resourceCount).eq(0);
    expect(corp.getStandardProjectDiscount(player, select.cards[0])).eq(6);
    corp.onStandardProject();
    expect(corp.getStandardProjectDiscount(player, select.cards[0])).eq(0);
  });

  it('Standard Business: first action places a tile of choice', () => {
    const corp = new StandardBusiness();
    const [, player] = withCorp(corp);
    const options = cast(corp.initialAction(player), OrOptions);
    expect(options.options).has.length(3);
  });

  it('Streamline Logistics: events add wild; spend 1 for 2 extra actions', () => {
    const corp = new StreamlineLogistics();
    const [, player] = withCorp(corp);
    corp.onCardPlayed(player, fakeCard({type: CardType.EVENT}));
    expect(corp.resourceCount).eq(1);
    const before = player.availableActionsThisRound;
    corp.action(player);
    expect(player.availableActionsThisRound).eq(before + 2);
    expect(corp.resourceCount).eq(0);
    expect(corp.canAct(player)).is.false;
  });

  it('Terra-Invest Firm: TR raises add wild; spend 1 for M€ production', () => {
    const corp = new TerraInvestFirm();
    const [game, player] = withCorp(corp);
    corp.initialAction(player);
    runAllActions(game);
    expect(player.terraformRating).eq(22);
    expect(corp.resourceCount).eq(2);
    corp.action(player);
    expect(player.production.megacredits).eq(1);
    expect(corp.resourceCount).eq(1);
  });

  it('Top-Up Operation: requirement cards add wild; spend 1 to ignore maximum requirements', () => {
    const corp = new TopUpOperation();
    const [game, player] = withCorp(corp);
    corp.resourceCount = 1;
    setOxygenLevel(game, 6);
    const card = fakeCard({name: 'max 3' as CardName, cost: 1, requirements: [{oxygen: 3, max: true}]});
    player.cardsInHand.push(card);
    player.megaCredits = 10;
    expect(player.canPlay(card)).is.false;
    const select = cast(corp.action(player), SelectProjectCardToPlay);
    expect(select.cards).deep.eq([card]);
    expect(corp.resourceCount).eq(0);
    select.payAndPlay(card, Payment.of({megacredits: 1}));
    // The card has requirements, so it adds a wild resource back.
    expect(corp.resourceCount).eq(1);
    expect(EpicHooks.ignoresMaxRequirements(player)).is.false;
  });
});
