import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {TileType} from '../../../src/common/TileType';
import {CardName} from '../../../src/common/cards/CardName';
import {Payment} from '../../../src/common/inputs/Payment';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {FloatingArrayStandardProject} from '../../../src/server/cards/venusphase2/FloatingArrayStandardProject';
import {GasMineStandardProject} from '../../../src/server/cards/venusphase2/GasMineStandardProject';
import {CloudCityStandardProject} from '../../../src/server/cards/venusphase2/CloudCityStandardProject';
import {VenusPhase2Expansion} from '../../../src/server/venus2/VenusPhase2Expansion';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {VenusAircraftHaven} from '../../../src/server/cards/venusphase2/VenusAircraftHaven';
import {NegativeMassFluids} from '../../../src/server/cards/venusphase2/NegativeMassFluids';
import {ImprovedFloatingSystems} from '../../../src/server/cards/venusphase2/ImprovedFloatingSystems';
import {toName} from '../../../src/common/utils/utils';

function venusGame() {
  return testGame(2, {venusNextExtension: true, venusPhase2Expansion: true});
}

describe('Venus Phase 2 standard projects', () => {
  it('are offered only with the Venus map', () => {
    const [game] = venusGame();
    const names = game.standardProjects.map(toName);
    expect(names).includes(CardName.FLOATING_ARRAY_STANDARD_PROJECT);
    expect(names).includes(CardName.GAS_MINE_STANDARD_PROJECT);
    expect(names).includes(CardName.CLOUD_CITY_STANDARD_PROJECT);
    const [plain] = testGame(2, {venusNextExtension: true});
    expect(plain.standardProjects.map(toName)).does.not.include(CardName.GAS_MINE_STANDARD_PROJECT);
  });

  it('cost 19 / 21 / 25 and give a tile, Venus, and production', () => {
    const [game, player] = venusGame();
    player.megaCredits = 65;

    new FloatingArrayStandardProject().payAndExecute(player, Payment.of({megacredits: 19}));
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v02'));
    runAllActions(game);

    const gasMine = new GasMineStandardProject();
    gasMine.payAndExecute(player, Payment.of({megacredits: 21}));
    runAllActions(game);
    const gasSelect = cast(player.popWaitingFor(), SelectSpace);
    expect(gasSelect.spaces.every((s) => s.spaceType === SpaceType.VENUS_GAS_MINE)).is.true;
    gasSelect.cb(gasSelect.spaces[0]);
    runAllActions(game);

    new CloudCityStandardProject().payAndExecute(player, Payment.of({megacredits: 25}));
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v03'));
    runAllActions(game);

    expect(player.megaCredits).eq(0);
    expect(game.getVenusScaleLevel()).eq(6);
    expect(player.production.heat).eq(1);
    expect(player.production.megacredits).eq(1);
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_FLOATING_ARRAY)).eq(1);
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_GAS_MINE)).eq(1);
    expect(VenusPhase2Expansion.count(player, TileType.VENUS_HABITAT)).eq(1);
  });

  it('floaters from any card count toward affordability', () => {
    const [/* game */, player] = venusGame();
    const sp = new FloatingArrayStandardProject();
    player.megaCredits = 10;
    expect(sp.canAct(player)).is.false;
    const haven = new VenusAircraftHaven();
    haven.resourceCount = 3;
    player.playedCards.push(haven);
    // 10 + 3 floaters x 3 = 19
    expect(sp.canAct(player)).is.true;
  });

  it('pays with floaters from several cards', () => {
    const [game, player] = venusGame();
    const haven = new VenusAircraftHaven();
    const dirigibles = new Dirigibles();
    haven.resourceCount = 2;
    dirigibles.resourceCount = 2;
    player.playedCards.push(haven, dirigibles);
    player.megaCredits = 10;

    const select = new SelectStandardProjectToPlay(player, game.standardProjects);
    const model = select.toModel(player);
    expect(model.floaters).eq(4);
    expect(model.floaterValue).eq(3);

    // 10 M€ + 3 floaters = 19
    expect(() => select.process({type: 'projectCard', card: CardName.FLOATING_ARRAY_STANDARD_PROJECT, payment: Payment.of({megacredits: 10, floaters: 3})}))
      .to.not.throw();
    runAllActions(game);
    const pick = cast(player.popWaitingFor(), SelectCard);
    const amount = cast(pick.cb([haven]), SelectAmount);
    expect(amount.min).eq(1);
    expect(amount.max).eq(2);
    amount.cb(2);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v02'));
    runAllActions(game);
    expect(haven.resourceCount + dirigibles.resourceCount).eq(1);
    expect(player.megaCredits).eq(0);
  });

  it('rejects underpayment and too many floaters', () => {
    const [game, player] = venusGame();
    const haven = new VenusAircraftHaven();
    haven.resourceCount = 1;
    player.playedCards.push(haven);
    player.megaCredits = 30;
    const select = new SelectStandardProjectToPlay(player, game.standardProjects);
    expect(() => select.process({type: 'projectCard', card: CardName.FLOATING_ARRAY_STANDARD_PROJECT, payment: Payment.of({megacredits: 15, floaters: 1})}))
      .to.throw(/Did not spend enough/);
    expect(() => select.process({type: 'projectCard', card: CardName.FLOATING_ARRAY_STANDARD_PROJECT, payment: Payment.of({megacredits: 13, floaters: 2})}))
      .to.throw(/floaters/);
  });

  it('Negative Mass Fluids makes floaters worth 4; Improved Floating Systems refunds 3 M€', () => {
    const [game, player] = venusGame();
    VenusPhase2Expansion.addTile(player, 'v02', {tileType: TileType.VENUS_HABITAT});
    const fluids = new NegativeMassFluids();
    expect(fluids.canPlay(player)).is.true;
    player.playedCards.push(fluids, new ImprovedFloatingSystems());
    expect(VenusPhase2Expansion.floaterValue(player)).eq(4);
    const haven = new VenusAircraftHaven();
    haven.resourceCount = 1;
    player.playedCards.push(haven);
    player.megaCredits = 15;
    const select = new SelectStandardProjectToPlay(player, game.standardProjects);
    select.process({type: 'projectCard', card: CardName.FLOATING_ARRAY_STANDARD_PROJECT, payment: Payment.of({megacredits: 15, floaters: 1})});
    runAllActions(game);
    expect(haven.resourceCount).eq(0);
    expect(player.megaCredits).eq(3);
  });

  it('Negative Mass Fluids needs your own Venus Habitat', () => {
    const [/* game */, player, other] = venusGame();
    VenusPhase2Expansion.addTile(other, 'v02', {tileType: TileType.VENUS_HABITAT});
    expect(new NegativeMassFluids().canPlay(player)).is.false;
  });
});
