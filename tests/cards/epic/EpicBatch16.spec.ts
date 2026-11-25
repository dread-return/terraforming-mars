import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {Tag} from '../../../src/common/cards/Tag';
import {Units} from '../../../src/common/Units';
import {CardResource} from '../../../src/common/CardResource';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectResources} from '../../../src/server/inputs/SelectResources';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {Polymorphics} from '../../../src/server/cards/epic/Polymorphics';
import {DynamicBusinessServices} from '../../../src/server/cards/epic/DynamicBusinessServices';
import {Exotica} from '../../../src/server/cards/epic/Exotica';
import {Tron} from '../../../src/server/cards/epic/Tron';
import {MarsUniversity} from '../../../src/server/cards/base/MarsUniversity';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Algae} from '../../../src/server/cards/base/Algae';
import {Payment} from '../../../src/common/inputs/Payment';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

function freeOption(player: TestPlayer, prefix: string): SelectOption | undefined {
  const free = EpicHooks.freeActionOption(player);
  return free === undefined ? undefined : cast(free, OrOptions).options.find((o) => String(o.title).startsWith(prefix)) as SelectOption | undefined;
}

describe('Epic Corporations batch 16', () => {
  it('Polymorphics: picks a production and a tag; changing the tag counts as playing it', () => {
    const corp = new Polymorphics();
    const [game, player] = testGame(2);
    player.playedCards.push(corp);
    player.defer(corp.play(player));
    runAllActions(game);
    // A production and a tag, in either order.
    for (let i = 0; i < 2; i++) {
      const [input, next] = player.popWaitingFor2();
      const choice = cast(input, OrOptions);
      const building = choice.options.find((o) => o.title === Tag.BUILDING);
      (building ?? choice.options.find((o) => String(o.title).includes('steel'))!).cb();
      next?.();
      runAllActions(game);
    }
    expect(player.production.steel).eq(1);
    expect(corp.tags).deep.eq([Tag.BUILDING]);
    expect(player.tags.count(Tag.BUILDING, 'raw')).eq(1);

    // Mars University reacts to a science tag being played.
    player.playedCards.push(new MarsUniversity());
    player.cardsInHand.push(new Algae());
    game.phase = Phase.ACTION;
    const action = cast(corp.action(player), OrOptions);
    action.options.find((o) => o.title === Tag.SCIENCE)!.cb();
    runAllActions(game);
    expect(corp.tags).deep.eq([Tag.SCIENCE]);
    // Mars University has a building and a science tag of its own.
    expect(player.tags.count(Tag.BUILDING, 'raw')).eq(1);
    expect(player.tags.count(Tag.SCIENCE, 'raw')).eq(2);
    expect(player.popWaitingFor()).is.not.undefined;
  });

  it('Dynamic Business Services: one effect per generation; its tag follows', () => {
    const corp = new DynamicBusinessServices();
    const [game, player] = withCorp(corp, {coloniesExtension: true});
    expect(corp.tags).deep.eq([Tag.CLONE]);
    expect(player.tags.distinctCount('default')).eq(0);

    cast(corp.action(player), OrOptions).options.find((o) => o.title === Tag.PLANT)!.cb();
    expect(corp.tags).deep.eq([Tag.PLANT]);
    const plants = player.plants;
    player.playCard(new Algae());
    runAllActions(game);
    expect(player.plants).gte(plants + 1 + 1); // Algae's own plant + the effect

    // Next generation the effect ends.
    EpicHooks.onGenerationStart(game);
    expect(corp.tags).deep.eq([Tag.CLONE]);
    expect(corp.active(player)).is.undefined;

    game.generation++;
    cast(corp.action(player), OrOptions).options.find((o) => o.title === Tag.SPACE)!.cb();
    expect(player.colonies.tradeDiscount).eq(1);
    EpicHooks.onGenerationStart(game);
    expect(player.colonies.tradeDiscount).eq(0);

    game.generation++;
    cast(corp.action(player), OrOptions).options.find((o) => o.title === Tag.EARTH)!.cb();
    const mc = player.megaCredits;
    player.drawCard(2);
    expect(player.megaCredits).eq(mc + 2);

    game.generation++;
    cast(corp.action(player), OrOptions).options.find((o) => o.title === Tag.BUILDING)!.cb();
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => s.bonus.length === 0)!;
    const steel = player.steel;
    game.addCity(player, space);
    expect(player.steel).eq(steel + 1);
  });

  it('Exotica: goods take any card resource, convert to standard resources, and its action collects resources', () => {
    const corp = new Exotica();
    const [game, player] = withCorp(corp);
    expect(corp.resourceCount).eq(5);
    expect(player.getResourceCards(CardResource.MICROBE)).contains(corp);

    const take = cast(freeOption(player, 'Exotica')!.cb(undefined), SelectAmount);
    cast(take.cb(2), SelectResources).cb({...Units.EMPTY, titanium: 1, megacredits: 1});
    expect(corp.resourceCount).eq(3);
    expect(player.titanium).eq(1);

    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    tardigrades.resourceCount = 4;
    const select = cast(corp.action(player), SelectCard);
    cast(select.cb([tardigrades]), SelectAmount).cb(3);
    runAllActions(game);
    expect(tardigrades.resourceCount).eq(1);
    expect(corp.resourceCount).eq(6);
  });

  it('TRON: after it passes, other players add administration or pay 1 M€; administration pays 2 M€', () => {
    const corp = new Tron();
    const [game, player, other] = withCorp(corp);
    expect(player.cardsInHand).has.length(3);
    game.playerHasPassed(player);
    other.megaCredits = 5;
    other.availableActionsThisRound = 2;
    other.actionsTakenThisRound = 0;

    EpicHooks.afterAction(other);
    runAllActions(game);
    cast(other.popWaitingFor(), OrOptions).options[0].cb();
    expect(corp.resourceCount).eq(1);

    EpicHooks.afterAction(other);
    runAllActions(game);
    cast(other.popWaitingFor(), OrOptions).options[1].cb();
    expect(other.megaCredits).eq(4);
    expect(corp.resourceCount).eq(1);

    // Administration pays 2 M€ for cards.
    corp.resourceCount = 3;
    expect(EpicHooks.epicPayment(player, new Algae())?.value).eq(2);
    expect(player.canAfford({cost: 10, epicResources: true} as never)).is.not.undefined;
    void Payment;
  });

  it('TRON: administration fills in missing plants for a greenery', () => {
    const corp = new Tron();
    const [, player] = withCorp(corp);
    corp.resourceCount = 5;
    player.plants = 5;
    const option = freeOption(player, 'TRON')!;
    option.cb(undefined);
    expect(player.plants).eq(8);
    expect(corp.resourceCount).eq(2);
    void SpaceType;
  });
});
