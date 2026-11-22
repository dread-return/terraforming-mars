import {expect} from 'chai';
import {ExpeditionVehicles} from '../../../src/server/cards/underworld/ExpeditionVehicles';
import {testGame} from '../../TestGame';
import {addCity, addOcean} from '../../TestingUtils';
import {TileType} from '../../../src/common/TileType';
import {VenusPhase2Expansion} from '../../../src/server/venus2/VenusPhase2Expansion';
import {Phase} from '../../../src/common/Phase';

describe('ExpeditionVehicles', () => {
  const onTilePlacedRuns = [
    {idx: 0, self: false, isolated: true, expected: {cardsInHand: 0}},
    {idx: 1, self: false, isolated: false, expected: {cardsInHand: 0}},
    {idx: 2, self: true, isolated: true, expected: {cardsInHand: 1}},
    {idx: 3, self: true, isolated: false, expected: {cardsInHand: 0}},
  ] as const;
  for (const run of onTilePlacedRuns) {
    it('onTilePlaced ' + run.idx, () => {
      const card = new ExpeditionVehicles();
      const [game, player, player2] = testGame(2, {underworldExpansion: true});

      const spaces = game.board.getAvailableSpacesOnLand(player);
      const neighbor = spaces[0];
      const space = game.board.getAdjacentSpaces(neighbor)[0];

      if (run.isolated === false) {
        game.simpleAddTile(player2, neighbor, {tileType: TileType.BIOFERTILIZER_FACILITY});
      }

      player.playedCards.push(card);

      addCity(run.self ? player : player2, space.id);
      expect(player.cardsInHand).has.length(run.expected.cardsInHand);
    });
  }

  it('onTilePlaced on the Venus Phase 2 map does not crash and draws for an isolated tile', () => {
    const card = new ExpeditionVehicles();
    const [game, player] = testGame(2, {underworldExpansion: true, venusNextExtension: true, venusPhase2Expansion: true});
    player.playedCards.push(card);

    const [space] = VenusPhase2Expansion.availableSpaces(player, TileType.CITY);
    VenusPhase2Expansion.addTile(player, space.id, {tileType: TileType.CITY});

    expect(game.moonData).is.undefined;
    expect(player.cardsInHand).has.length(1);
  });

  it('A neutral cube is not an adjacent tile', () => {
    const card = new ExpeditionVehicles();
    const [game, player] = testGame(2, {underworldExpansion: true});

    const spaces = game.board.getAvailableSpacesOnLand(player);
    const neighbor = spaces[0];
    const space = game.board.getAdjacentSpaces(neighbor)[0];

    neighbor.cube = 'martian-nature-wonders';

    player.playedCards.push(card);

    addCity(player, space.id);
    expect(player.cardsInHand).has.length(1);
  });

  for (const run of [
    {phase: Phase.ACTION, expected: 1},
    {phase: Phase.SOLAR, expected: 0},
  ] as const) {
    it('Does not draw during WGT' + JSON.stringify(run), () => {
      const card = new ExpeditionVehicles();
      const [game, player] = testGame(2, {underworldExpansion: true});

      const spaces = game.board.getAvailableSpacesForOcean(player);
      const space = spaces[0];

      player.playedCards.push(card);

      game.phase = run.phase;
      addOcean(player, space.id);

      expect(player.cardsInHand).has.length(run.expected);
    });
  }
});
