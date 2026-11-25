import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {SpaceBonus} from '../../../src/common/boards/SpaceBonus';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {Space} from '../../../src/server/boards/Space';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {Arc} from '../../../src/server/cards/epic/Arc';
import {NeithEnterprise} from '../../../src/server/cards/epic/NeithEnterprise';
import {SovietMars} from '../../../src/server/cards/epic/SovietMars';
import {TyrellCorporation} from '../../../src/server/cards/epic/TyrellCorporation';
import {Pets} from '../../../src/server/cards/base/Pets';
import {SpaceStation} from '../../../src/server/cards/base/SpaceStation';
import {Algae} from '../../../src/server/cards/base/Algae';
import {GanymedeColony} from '../../../src/server/cards/base/GanymedeColony';
import {cardsToModel} from '../../../src/server/models/ModelUtils';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

function openSpace(game: IGame, exclude: Array<Space> = []): Space {
  const board = game.board;
  return board.spaces.find((space) =>
    space.spaceType === SpaceType.LAND && space.tile === undefined && space.player === undefined && !exclude.includes(space) &&
    board.getAdjacentSpaces(space).length === 6 &&
    board.getAdjacentSpaces(space).every((s) => s.spaceType === SpaceType.LAND && s.tile === undefined && s.player === undefined && !exclude.includes(s)))!;
}

function freeOption(player: TestPlayer, prefix: string): SelectOption | undefined {
  const free = EpicHooks.freeActionOption(player);
  return free === undefined ? undefined : cast(free, OrOptions).options.find((o) => String(o.title).startsWith(prefix)) as SelectOption | undefined;
}

describe('Epic Corporations batch 19', () => {
  it('ARC: moves animals onto greeneries and spends animals for 1 M€ per populated greenery', () => {
    const corp = new Arc();
    const [game, player] = withCorp(corp);
    expect(corp.resourceCount).eq(2);
    const pets = new Pets();
    player.playedCards.push(pets);
    pets.resourceCount = 1;
    const g1 = openSpace(game);
    const g2 = game.board.getAdjacentSpaces(g1)[0];
    game.addGreenery(player, g1);
    game.addGreenery(player, g2);

    for (const [card, space] of [[pets, g1], [corp, g2]] as const) {
      const choice = cast(corp.action(player), OrOptions);
      const select = cast(choice.options[0].cb(), SelectCard);
      cast(select.cb([card]), SelectSpace).cb(space);
    }
    expect(corp.data.tiles).deep.eq([g1.id, g2.id]);
    expect(corp.resourceCount).eq(1);
    expect(corp.populated(player)).deep.eq({greeneries: 2, oceans: 0});

    const mc = player.megaCredits;
    const spend = freeOption(player, 'ARC: spend animals for 2 M€')!.cb(undefined);
    if (spend instanceof SelectAmount) {
      spend.cb(1);
    }
    expect(player.megaCredits).eq(mc + 2);
    expect(corp.resourceCount).eq(0);
  });

  it('Neith Enterprise: city on Neith HQ; off-Mars cities raise its M€ production; action looks at X cards', () => {
    const corp = new NeithEnterprise();
    const [game, player, other] = withCorp(corp);
    const hq = game.board.getSpaceOrThrow(SpaceName.NEITH_HQ);
    expect(hq.spaceType).eq(SpaceType.COLONY);
    corp.initialAction(player);
    runAllActions(game);
    expect(hq.tile?.tileType).eq(TileType.CITY);
    expect(player.production.megacredits).eq(1);

    other.playCard(new GanymedeColony());
    runAllActions(game);
    expect(player.production.megacredits).eq(2);

    // Empty off-Mars city areas: Phobos Space Haven at least.
    const empty = NeithEnterprise.emptyAreas(player);
    expect(empty).gte(1);
    player.megaCredits = 10;
    corp.action(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    expect(select.cards).has.length(empty);
    expect(player.megaCredits).eq(5);
  });

  it('Soviet Mars: mining tile first, communes per tile, gulag discount and -2 VP, adjacency rule', () => {
    const corp = new SovietMars();
    const [game, player] = withCorp(corp);
    const select = cast(corp.initialAction(player), SelectSpace);
    const space = select.spaces.find((s) => s.bonus.includes(SpaceBonus.STEEL) && !s.bonus.includes(SpaceBonus.TITANIUM))!;
    select.cb(space);
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.MINING_RIGHTS);
    expect(player.production.steel).eq(1);
    expect(corp.resourceCount).eq(1);

    // Tiles must go next to its own when possible.
    const land = game.board.getAvailableSpacesOnLand(player);
    expect(land.every((s) => game.board.getAdjacentSpaces(s).includes(space))).is.true;

    const algae = new Algae();
    expect(corp.getCardDiscount(player, algae)).eq(1);
    player.setTerraformRating(20);
    corp.action(player);
    expect(player.terraformRating).eq(18);
    expect(corp.resourceCount).eq(0);
    expect(corp.data.gulag).eq(1);
    // Algae costs 10: 4 off, never below 3.
    expect(corp.getCardDiscount(player, algae)).eq(4);
    expect(corp.getCardDiscount(player, new Pets())).eq(4);
    expect(corp.getVictoryPoints()).eq(-2);

    // Only Mars tiles add communes: not off-Mars city areas, the Moon or the Venus map.
    const communes = corp.resourceCount;
    const phobos = game.board.getSpaceOrThrow(SpaceName.PHOBOS_SPACE_HAVEN);
    game.addCity(player, phobos);
    corp.onTilePlaced(player, player, game.board.getAvailableSpacesOnLand(player)[0], 'moon');
    corp.onTilePlaced(player, player, game.board.getAvailableSpacesOnLand(player)[0], 'venus');
    expect(corp.resourceCount).eq(communes);

    // The card in play shows the gulag count and the lasting discount (1 per commune here, 4 per commune in the gulag).
    player.addResourceTo(corp, 2);
    const model = cardsToModel(player, [corp])[0];
    expect(model.gulag).eq(1);
    expect(model.discount).deep.eq([{amount: 2 + 4}]);
  });

  it('Soviet Mars: city rules apply first; with no legal city spot next to its tiles, any legal spot is allowed', () => {
    const corp = new SovietMars();
    const [game, player] = withCorp(corp);
    const board = game.board;
    const city = openSpace(game);
    game.addCity(player, city);
    // Every space next to its only tile is next to its city, so a new city can't go there.
    const cities = board.getAvailableSpacesForCity(player);
    expect(cities.length).gt(0);
    expect(cities.some((s) => board.getAdjacentSpaces(s).includes(city))).is.false;
    // Greeneries still go next to its tiles.
    const greeneries = board.getAvailableSpacesForGreenery(player);
    expect(greeneries.every((s) => board.getAdjacentSpaces(s).includes(city))).is.true;
    // Fixed kinds of area aren't restricted.
    const volcanic = board.getAvailableVolcanicSpaces(player);
    expect(volcanic.length).eq(board.volcanicSpaceIds.filter((id) => board.getSpaceOrThrow(id).tile === undefined).length);
  });

  it('Tyrell Corporation: hosts a space/building card with 2 resources, doubles them, and plays it at a discount', () => {
    const corp = new TyrellCorporation();
    const [game, player] = withCorp(corp);
    const station = new SpaceStation();
    player.cardsInHand.push(station, new Algae());
    const place = cast(corp.action(player), SelectCard);
    expect(place.cards).deep.eq([station]);
    place.cb([station]);
    expect(corp.targetCards).deep.eq([station]);
    expect(player.cardsInHand.map((c) => c.name)).not.contains(station.name);
    // Algae isn't a space or building card, so only doubling is offered.
    cast(corp.action(player), SelectCard).cb([station]);
    expect(station.resourceCount).eq(4);
    expect(player.getSelfReplicatingRobotsTargetCards()).contains(station);
    expect(corp.getCardDiscount(player, station)).eq(4);

    player.megaCredits = 20;
    expect(player.getPlayableCards().map((c) => c.name)).contains(station.name);
    player.playCard(station);
    runAllActions(game);
    expect(corp.targetCards).is.empty;
    expect(player.playedCards.has(station.name)).is.true;
  });
});
