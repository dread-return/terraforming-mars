import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, fakeCard, runAllActions} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {TileType} from '../../../src/common/TileType';
import {CardResource} from '../../../src/common/CardResource';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectPaymentDeferred} from '../../../src/server/deferredActions/SelectPaymentDeferred';
import {Payment} from '../../../src/common/inputs/Payment';
import {Nuclear} from '../../../src/server/cards/nuclear/Nuclear';
import {UraniumMine} from '../../../src/server/cards/nuclear/UraniumMine';
import {ParticleAccelerator} from '../../../src/server/cards/nuclear/ParticleAccelerator';
import {FreeRadicals} from '../../../src/server/cards/nuclear/FreeRadicals';
import {NuclearClassifiedLaboratory} from '../../../src/server/cards/nuclear/NuclearClassifiedLaboratory';
import {RadiationShielding} from '../../../src/server/cards/nuclear/RadiationShielding';
import {WaterReservoirAnalysis} from '../../../src/server/cards/nuclear/WaterReservoirAnalysis';
import {FalseFlagOperations} from '../../../src/server/cards/nuclear/FalseFlagOperations';
import {RadioactiveDeflux} from '../../../src/server/cards/nuclear/RadioactiveDeflux';
import {EvacuationZone} from '../../../src/server/cards/nuclear/EvacuationZone';
import {AerosolIsotopes} from '../../../src/server/cards/nuclear/AerosolIsotopes';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Fish} from '../../../src/server/cards/base/Fish';
import {NuclearZone} from '../../../src/server/cards/base/NuclearZone';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';

function radioactive(n: number) {
  return fakeCard({tags: Array(n).fill(Tag.RADIOACTIVE)});
}

/** Places every Nuclear Zone the track asks for on the first offered space. */
function placeZones(game: IGame, player: TestPlayer) {
  runAllActions(game);
  let input = player.popWaitingFor();
  while (input !== undefined) {
    cast(input, SelectSpace).cb(cast(input, SelectSpace).spaces[0]);
    runAllActions(game);
    input = player.popWaitingFor();
  }
}

describe('Nuclear engine', () => {
  it('Radioactive tags move the contamination track, only with Nuclear on', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    player.onCardPlayed(radioactive(2));
    expect(game.contamination).eq(2);

    const [plain, plainPlayer] = testGame(2);
    plainPlayer.onCardPlayed(radioactive(2));
    expect(plain.contamination).eq(0);
  });

  it('step 3 places a Nuclear Zone owned by the player', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    player.onCardPlayed(radioactive(3));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.NUCLEAR_ZONE);
    expect(space.player).eq(player);
  });

  it('steps 5 and 13 give radiation', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    const card = new UraniumEnrichmentHolder();
    player.playedCards.push(card);
    player.onCardPlayed(radioactive(5));
    placeZones(game, player);
    expect(card.resourceCount).eq(1);
    game.contamination = 12;
    player.onCardPlayed(radioactive(1));
    runAllActions(game);
    expect(card.resourceCount).eq(3);
  });

  it('the track stops at 19', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    game.contamination = 18;
    player.onCardPlayed(radioactive(4));
    expect(game.contamination).eq(19);
  });

  it('the contamination level survives a save and reload', () => {
    const [game] = testGame(2, {nuclearExpansion: true});
    game.contamination = 7;
    const serialized = game.serialize();
    expect(serialized.contamination).eq(7);
  });

  it('placing next to a Nuclear Zone costs 2 M€ without Ares', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    const zone = game.board.getAvailableSpacesOnLand(player)[10];
    game.addTile(player, zone, {tileType: TileType.NUCLEAR_ZONE});
    const next = game.board.getAdjacentSpaces(zone).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    player.megaCredits = 1;
    expect(game.board.getAvailableSpacesOnLand(player)).does.not.include(next);
    player.megaCredits = 10;
    game.addTile(player, next, {tileType: TileType.GREENERY});
    runAllActions(game);
    expect(player.megaCredits).eq(8);
  });

  it('the base Nuclear Zone also costs 2 M€ to place next to in Nuclear games', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    new NuclearZone().play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const zone = select.spaces[5];
    select.cb(zone);
    const next = game.board.getAdjacentSpaces(zone).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    expect(Nuclear.defaultAdjacencyCost(game, zone)).eq(2);
    player.megaCredits = 5;
    game.addTile(player, next, {tileType: TileType.GREENERY});
    runAllActions(game);
    expect(player.megaCredits).eq(3);
  });

  it('Radioactive Deflux takes an animal from whoever places next to it', () => {
    const [game, player, opponent] = testGame(2, {nuclearExpansion: true});
    new RadioactiveDeflux().play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const space = select.spaces[8];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.RADIOACTIVE_DEFLUX);
    const fish = new Fish();
    fish.resourceCount = 2;
    opponent.playedCards.push(fish);
    const next = game.board.getAdjacentSpaces(space).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    game.addTile(opponent, next, {tileType: TileType.GREENERY});
    runAllActions(game);
    expect(fish.resourceCount).eq(1);
  });

  it('Evacuation Zone covers a greenery, keeps its owner, and costs a plant and a microbe nearby', () => {
    const [game, player, opponent] = testGame(2, {nuclearExpansion: true});
    const greenery = addGreenery(opponent);
    const card = new EvacuationZone();
    expect(card.canPlay(player)).is.true;
    const select = cast(card.play(player), SelectSpace);
    select.cb(greenery);
    expect(greenery.tile?.tileType).eq(TileType.EVACUATION_ZONE);
    expect(greenery.player).eq(opponent);

    const tardigrades = new Tardigrades();
    tardigrades.resourceCount = 3;
    player.playedCards.push(tardigrades);
    player.plants = 4;
    const next = game.board.getAdjacentSpaces(greenery).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    game.addTile(player, next, {tileType: TileType.CITY});
    runAllActions(game);
    expect(player.plants).eq(3);
    expect(tardigrades.resourceCount).eq(2);
  });

  it('Aerosol Isotopes: an opponent raising oxygen loses a resource; its owner adds radiation', () => {
    const [game, player, opponent] = testGame(2, {nuclearExpansion: true});
    player.playedCards.push(new AerosolIsotopes());
    const holder = new UraniumEnrichmentHolder();
    player.playedCards.push(holder);
    opponent.steel = 2;
    opponent.heat = 1;
    game.increaseOxygenLevel(opponent, 1);
    runAllActions(game);
    const orOptions = cast(opponent.popWaitingFor(), OrOptions);
    cast(orOptions.options[0], SelectOption).cb();
    expect(opponent.steel).eq(1);
    game.increaseOxygenLevel(player, 1);
    runAllActions(game);
    expect(holder.resourceCount).eq(1);
  });

  it('Free Radicals lets steel pay for radioactive cards', () => {
    const [, player] = testGame(2, {nuclearExpansion: true});
    const card = new ParticleAccelerator();
    expect(Nuclear.canUseSteel(player, card)).is.false;
    player.playedCards.push(new FreeRadicals());
    expect(Nuclear.canUseSteel(player, card)).is.true;
    expect(Nuclear.canUseSteel(player, new UraniumMineNonRadioactive())).is.false;
  });

  it('Nuclear Classified Laboratory: titanium pays for science cards; titanium only adds a radiation', () => {
    const [game, player] = testGame(2, {nuclearExpansion: true});
    const lab = new NuclearClassifiedLaboratory();
    player.playedCards.push(lab);
    const holder = new UraniumEnrichmentHolder();
    player.playedCards.push(holder);
    const card = new ParticleAccelerator();
    expect(Nuclear.canUseTitanium(player, card)).is.true;
    Nuclear.onProjectCardPaid(player, card, Payment.of({titanium: 6}));
    runAllActions(game);
    expect(holder.resourceCount).eq(1);
    Nuclear.onProjectCardPaid(player, card, Payment.of({titanium: 4, megacredits: 6}));
    runAllActions(game);
    expect(holder.resourceCount).eq(1);
  });

  it('Radiation Shielding: steel worth 1 more with 5 radiation', () => {
    const [, player] = testGame(2, {nuclearExpansion: true});
    const card = new RadiationShielding();
    player.playedCards.push(card);
    card.resourceCount = 4;
    expect(player.getSteelValue()).eq(2);
    card.resourceCount = 5;
    expect(player.getSteelValue()).eq(3);
  });

  it('Water Reservoir Analysis: opponents\' next space card costs 5 more, next building card 2 more', () => {
    const [game, player, opponent] = testGame(2, {nuclearExpansion: true});
    const card = new WaterReservoirAnalysis();
    card.play(player);
    player.playedCards.push(card);
    const spaceCard = new ParticleAccelerator();
    spaceCard.tags.length; // science/power only
    const space = fakeCard({cost: 10, tags: [Tag.SPACE]});
    const building = fakeCard({cost: 10, tags: [Tag.BUILDING]});
    expect(opponent.getCardCost(space)).eq(15);
    expect(opponent.getCardCost(building)).eq(12);
    expect(player.getCardCost(space)).eq(10);
    Nuclear.onProjectCardPaid(opponent, space, Payment.of({megacredits: 15}));
    expect(opponent.getCardCost(space)).eq(10);
    expect(opponent.getCardCost(building)).eq(12);
    game.generation++;
    expect(opponent.getCardCost(building)).eq(10);
  });

  it('False Flag Operations: marked tag costs opponents 1 more; circled tags hit everyone', () => {
    const [, player, opponent] = testGame(2, {nuclearExpansion: true});
    const card = new FalseFlagOperations();
    player.playedCards.push(card);
    card.data = {tag: Tag.EARTH};
    const earth = fakeCard({cost: 10, tags: [Tag.EARTH]});
    expect(opponent.getCardCost(earth)).eq(11);
    expect(player.getCardCost(earth)).eq(10);
    card.data = {tag: Tag.SPACE};
    const space = fakeCard({cost: 10, tags: [Tag.SPACE]});
    expect(opponent.getCardCost(space)).eq(11);
    expect(player.getCardCost(space)).eq(11);
  });

  it('a SelectPaymentDeferred import keeps working', () => {
    expect(SelectPaymentDeferred).is.not.undefined;
    expect(CardResource.RADIATION).eq('Radiation');
  });
});

/** A radiation-holding card used as a target in these tests. */
class UraniumEnrichmentHolder extends RadiationShielding {}

/** A card without a radioactive tag. */
class UraniumMineNonRadioactive extends UraniumMine {
  public override get tags() {
    return [Tag.BUILDING];
  }
}
