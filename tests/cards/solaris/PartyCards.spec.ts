import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, fakeCard, runAllActions, setRulingParty} from '../../TestingUtils';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {CardResource} from '../../../src/common/CardResource';
import {CondensationPlant} from '../../../src/server/cards/solaris/CondensationPlant';
import {WasteIncinerator} from '../../../src/server/cards/solaris/WasteIncinerator';
import {GiantIndustrialComplex} from '../../../src/server/cards/solaris/GiantIndustrialComplex';
import {WishMachine} from '../../../src/server/cards/solaris/WishMachine';
import {CompanyNationalization} from '../../../src/server/cards/solaris/CompanyNationalization';
import {TerrainLease} from '../../../src/server/cards/solaris/TerrainLease';
import {SynergisticForests} from '../../../src/server/cards/solaris/SynergisticForests';
import {Supercapacitors} from '../../../src/server/cards/promo/Supercapacitors';
import {Teractor} from '../../../src/server/cards/corporation/Teractor';
import {PowerPlantStandardProject} from '../../../src/server/cards/base/standardProjects/PowerPlantStandardProject';
import {SellPatentsStandardProject} from '../../../src/server/cards/base/standardProjects/SellPatentsStandardProject';
import {Tag} from '../../../src/common/cards/Tag';
import {Payment} from '../../../src/common/inputs/Payment';

describe('Solaris cards with official party requirements', () => {
  it('Condensation Plant: extra heat for energy converted in production', () => {
    const card = new CondensationPlant();
    const [game, player] = testGame(2, {turmoilExtension: true});
    expect(card.canPlay(player)).is.false;
    setRulingParty(game, PartyName.KELVINISTS);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    player.energy = 3;
    player.runProductionPhase();
    expect(player.energy).eq(0);
    expect(player.heat).eq(6);
  });

  it('Condensation Plant works with Supercapacitors', () => {
    const [game, player] = testGame(2, {turmoilExtension: true});
    player.playedCards.push(new CondensationPlant(), new Supercapacitors());
    player.energy = 4;
    player.runProductionPhase();
    runAllActions(game);
    cast(player.popWaitingFor(), SelectAmount).cb(3);
    expect(player.energy).eq(1);
    expect(player.heat).eq(6);
  });

  it('Waste Incinerator and Giant Industrial Complex', () => {
    const [game, player] = testGame(2, {turmoilExtension: true});
    const incinerator = new WasteIncinerator();
    const complex = new GiantIndustrialComplex();
    setRulingParty(game, PartyName.KELVINISTS);
    expect(incinerator.canPlay(player)).is.true;
    expect(complex.canPlay(player)).is.false;
    incinerator.play(player);
    expect(player.production.heat).eq(3);
    setRulingParty(game, PartyName.MARS);
    expect(complex.canPlay(player)).is.true;
    complex.play(player);
    expect(player.production.asUnits()).deep.include({steel: 1, titanium: 1, energy: 1, heat: 4});
  });

  it('Wish Machine: adds 1 resource to a card that already has one', () => {
    const card = new WishMachine();
    const [game, player] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.SCIENTISTS);
    expect(card.canPlay(player)).is.true;
    const a = fakeCard({resourceType: CardResource.ANIMAL});
    const b = fakeCard({resourceType: CardResource.MICROBE});
    player.playedCards.push(card, a, b);
    expect(card.canAct(player)).is.false;
    a.resourceCount = 1;
    expect(card.action(player)).is.undefined;
    expect(a.resourceCount).eq(2);
    b.resourceCount = 1;
    const selectCard = cast(card.action(player), SelectCard);
    selectCard.cb([b]);
    expect(b.resourceCount).eq(2);
  });

  it('Company Nationalization: pick one reward and lose the corporation', () => {
    const card = new CompanyNationalization();
    const [game, player] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.REDS);
    const teractor = new Teractor();
    player.playedCards.push(teractor);
    expect(player.tags.count(Tag.EARTH)).eq(1);
    const orOptions = cast(card.play(player), OrOptions);
    orOptions.options[0].cb();
    expect(player.production.megacredits).eq(2);
    expect(player.megaCredits).eq(15);
    expect(player.playedCards.corporations()).is.empty;
    expect(player.tags.count(Tag.EARTH)).eq(0);
  });

  it('Terrain Lease: 1 M€ whenever any player uses a standard project, but not Sell Patents', () => {
    const card = new TerrainLease();
    const [game, player, player2] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.REDS);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    player2.megaCredits = 11;
    new PowerPlantStandardProject().payAndExecute(player2, Payment.of({megacredits: 11}));
    runAllActions(game);
    expect(player.megaCredits).eq(1);
    player2.cardsInHand.push(fakeCard());
    new SellPatentsStandardProject().payAndExecute(player2, Payment.EMPTY);
    runAllActions(game);
    expect(player.megaCredits).eq(1);
  });

  it('Synergistic Forests: 1 plant for each tile you place next to your greenery', () => {
    const card = new SynergisticForests();
    const [game, player, player2] = testGame(2, {turmoilExtension: true});
    setRulingParty(game, PartyName.GREENS);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    const greenery = addGreenery(player);
    expect(player.plants).eq(0);
    const next = game.board.getAdjacentSpaces(greenery).filter((s) => s.tile === undefined && s.spaceType === 'land');
    addGreenery(player2, next[0].id);
    expect(player.plants).eq(0);
    addGreenery(player, next[1].id);
    expect(player.plants).eq(1);
  });
});
