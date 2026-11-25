import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {Units} from '../../../src/common/Units';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectResources} from '../../../src/server/inputs/SelectResources';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {Amazonis} from '../../../src/server/cards/epic/Amazonis';
import {Moar} from '../../../src/server/cards/epic/Moar';
import {Productivity} from '../../../src/server/turmoil/globalEvents/Productivity';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {Luna} from '../../../src/server/colonies/Luna';
import {GeneralAlliance} from '../../../src/server/cards/epic/GeneralAlliance';
import {ImakitaIndustrial} from '../../../src/server/cards/epic/ImakitaIndustrial';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Donation} from '../../../src/server/cards/prelude/Donation';
import {IPreludeCard} from '../../../src/server/cards/prelude/IPreludeCard';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

function amazonisOption(player: TestPlayer): SelectOption | undefined {
  const free = EpicHooks.freeActionOption(player);
  return free === undefined ? undefined : cast(free, OrOptions).options.find((o) => o.title.toString().startsWith('Amazonis')) as SelectOption | undefined;
}

describe('Epic Corporations batch 15', () => {
  it('Amazonis: an opponent buys resources at 3 M€ each and Amazonis takes 2 M€ each', () => {
    const corp = new Amazonis();
    const [game, player, other] = withCorp(corp);
    expect(player.production.megacredits).eq(2);
    other.megaCredits = 10;
    player.megaCredits = 0;

    const amount = cast(amazonisOption(other)!.cb(undefined), SelectAmount);
    expect(amount.max).eq(3);
    const select = cast(amount.cb(2), SelectResources);
    expect(() => select.cb({...Units.EMPTY, megacredits: 1, steel: 1})).to.throw(/other than M€/);
    select.cb({...Units.EMPTY, steel: 1, titanium: 1});
    runAllActions(game);
    expect(other.megaCredits).eq(4);
    expect(other.steel).eq(1);
    expect(other.titanium).eq(1);
    expect(player.megaCredits).eq(4);
  });

  it('Amazonis: buying for itself pays no cut; nothing offered without 3 M€', () => {
    const corp = new Amazonis();
    const [game, player, other] = withCorp(corp);
    player.megaCredits = 3;
    const select = cast(amazonisOption(player)!.cb(undefined), SelectResources);
    select.cb({...Units.EMPTY, plants: 1});
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(player.plants).eq(1);
    other.megaCredits = 2;
    expect(amazonisOption(other)).is.undefined;
  });

  it('Moar: a tile on Mars giving resources gives 1 more', () => {
    const corp = new Moar();
    const [game, player] = withCorp(corp);
    const space = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined &&
      game.board.getAdjacentSpaces(s).every((a) => a.tile === undefined && a.spaceType !== SpaceType.OCEAN))!;
    space.bonus = [SpaceBonus.STEEL, SpaceBonus.STEEL];
    game.addGreenery(player, space);
    runAllActions(game);
    expect(player.steel).eq(3);

    // Two kinds of resources: pick one.
    const next = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined && s !== space &&
      game.board.getAdjacentSpaces(s).every((a) => a.tile === undefined && a.spaceType !== SpaceType.OCEAN))!;
    next.bonus = [SpaceBonus.PLANT, SpaceBonus.TITANIUM];
    const plants = player.plants;
    game.addCity(player, next);
    runAllActions(game);
    const choice = cast(player.popWaitingFor(), OrOptions);
    expect(choice.options).has.length(2);
    choice.options.find((o) => o.title.toString().includes('plants'))!.cb();
    expect(player.titanium).eq(1);
    expect(player.plants).eq(plants + 2);
  });

  it('Moar: global events and colonies give 1 more', () => {
    const corp = new Moar();
    const [game, player] = withCorp(corp, {turmoilExtension: true, coloniesExtension: true});
    player.production.add('steel', 2);
    const turmoil = Turmoil.getTurmoil(game);
    const steel = player.steel;
    // Resolve the event directly through the same hook path as Turmoil.
    const before = EpicHooks.moarBefore(player);
    new Productivity().resolve(game, turmoil);
    EpicHooks.moarAfter(player, before);
    runAllActions(game);
    expect(player.steel).eq(steel + 3);

    const luna = new Luna();
    const mc = player.megaCredits;
    const income = luna.metadata.trade.quantity[luna.trackPosition];
    luna.trade(player);
    runAllActions(game);
    const gained = player.megaCredits - mc;
    expect(gained).eq(income + 1);
  });

  it('Moar: project cards that give resources give 1 more', () => {
    const corp = new Moar();
    const [game, player] = withCorp(corp);
    const card = {type: 'event', behavior: {stock: {titanium: 2}}} as unknown as Parameters<Moar['onCardPlayed']>[1];
    corp.onCardPlayed(player, card);
    runAllActions(game);
    expect(player.titanium).eq(1);
  });

  it('General Alliance: draws 2 preludes each research phase and plays one for 18 M€', () => {
    const corp = new GeneralAlliance();
    const [game, player] = withCorp(corp, {preludeExtension: true});
    expect(corp.canAct(player)).is.false;
    game.preludeDeck.drawPile.push(new Donation(), new Donation());
    EpicHooks.onResearchPhaseStart(player);
    expect(corp.data.preludes).has.length(2);
    expect(player.preludeCardsInHand).is.empty;

    player.megaCredits = 17;
    expect(corp.canAct(player)).is.false;
    player.megaCredits = 20;
    expect(corp.canAct(player)).is.true;
    corp.action(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard<IPreludeCard>);
    expect(select.cards).has.length(2);
    select.cb([select.cards[0]]);
    runAllActions(game);
    // Donation gives 21 M€.
    expect(player.megaCredits).eq(20 - 18 + 21);
    expect(corp.data.preludes).has.length(1);
  });

  it('Imakita Industrial: 6 preludes, free starting cards, only passing before generation 3', () => {
    const corp = new ImakitaIndustrial();
    const [game, player] = testGame(2, {preludeExtension: true});
    player.preludeCardsInHand.push(new Donation(), new Donation());
    player.megaCredits = 0;
    for (let i = 0; i < 10; i++) {
      player.cardsInHand.push(game.projectDeck.draw(game)!);
    }
    player.playCorporationCard(corp);
    runAllActions(game);
    expect(player.preludeCardsInHand).has.length(6);
    expect(player.megaCredits).eq(42);

    game.phase = Phase.ACTION;
    game.generation = 2;
    const actions = cast(player.getActions(), OrOptions);
    expect(actions.options.map((o) => String(o.title))).deep.eq(['Pass for this generation']);
    game.generation = 3;
    expect(cast(player.getActions(), OrOptions).options.length).gt(1);
  });
});
