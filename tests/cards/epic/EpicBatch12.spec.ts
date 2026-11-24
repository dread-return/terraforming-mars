import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {KongInc} from '../../../src/server/cards/epic/KongInc';
import {Prototek} from '../../../src/server/cards/epic/Prototek';
import {CloudComputing} from '../../../src/server/cards/epic/CloudComputing';
import {WaterSplittingPlant} from '../../../src/server/cards/base/WaterSplittingPlant';

function withCorp(corp: ICorporationCard): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 12 (action rules)', () => {
  it('Kong.Inc: non-blue actions cost 1 plant; with no plants only blue-card actions remain', () => {
    const corp = new KongInc();
    const [, player] = withCorp(corp);
    expect(player.production.megacredits).eq(9);
    expect(player.plants).eq(2);
    expect(corp.canAct(player)).is.false;

    // A standard action costs 1 plant.
    EpicHooks.afterAction(player);
    expect(player.plants).eq(1);
    // A blue-card action doesn't.
    EpicHooks.onCardAction(player, new WaterSplittingPlant());
    EpicHooks.afterAction(player);
    expect(player.plants).eq(1);
    // Passing isn't an action.
    player.plants = 0;
    expect(corp.canAct(player)).is.true;
    const titles = player.getActions().options.map((o) => String(o.title));
    expect(titles).contains('Pass for this generation');
    expect(titles).contains('Perform an action from a played card');
    expect(titles.some((t) => t.includes('Standard project') || t.includes('Play project card'))).is.false;

    // Its own action: +2 plants, then the action's plant.
    corp.action(player);
    EpicHooks.onCardAction(player, corp);
    EpicHooks.afterAction(player);
    expect(player.plants).eq(1);
  });

  it('Prototek: a blue card\'s declared action can be used right away without its cost', () => {
    const corp = new Prototek();
    const [game, player] = withCorp(corp);
    player.energy = 0;
    const card = new WaterSplittingPlant();
    corp.onCardPlayed(player, card);
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[0].cb(undefined);
    runAllActions(game);
    expect(game.getOxygenLevel()).eq(1);
    expect(player.energy).eq(0);
    expect(Prototek.freeAction(card)?.spend).is.undefined;
  });

  it('Cloud Computing: uses last time\'s look-ahead research cards and draws the next set', () => {
    const corp = new CloudComputing();
    const [, player] = withCorp(corp);
    const first = corp.researchDraw(player, 4);
    expect(first).has.length(4);
    const next = corp.nextCards().map((c) => c.name);
    expect(next).has.length(4);
    const second = corp.researchDraw(player, 4);
    expect(second.map((c) => c.name)).deep.eq(next);
    expect(EpicHooks.freeActionOption(player)).is.not.undefined;
  });

  it('Cloud Computing: pays 3 M€ to act before the first player', () => {
    const corp = new CloudComputing();
    const [game, player] = withCorp(corp);
    game.generation = 2;
    player.megaCredits = 5;
    let normal = false;
    expect(EpicHooks.offerCloudPreTurn(game, () => normal = true)).is.true;
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[0].cb(undefined);
    expect(player.megaCredits).eq(2);
    expect(player.availableActionsThisRound).eq(1);
    expect(game.activePlayer).eq(player);
    expect(EpicHooks.endCloudPreTurn(game)).is.true;
    expect(EpicHooks.endCloudPreTurn(game)).is.false;
    expect(normal).is.false;

    // Generation 1 and too little money: no offer.
    player.megaCredits = 2;
    expect(EpicHooks.offerCloudPreTurn(game, () => normal = true)).is.false;
  });
});
