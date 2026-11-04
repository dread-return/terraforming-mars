import {expect} from 'chai';
import {TwinPlanetCommerceNetwork} from '../../../src/server/cards/betterments/TwinPlanetCommerceNetwork';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';
import {SpaceName} from '../../../src/common/boards/SpaceName';
import {TileType} from '../../../src/common/TileType';

describe('TwinPlanetCommerceNetwork', () => {
  it('requires a floater, raises TR per off-Mars city, adds 3 floaters', () => {
    const card = new TwinPlanetCommerceNetwork();
    const [game, player, player2] = testGame(2, {venusNextExtension: true});
    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    expect(card.canPlay(player)).is.false;
    dirigibles.resourceCount = 1;
    expect(card.canPlay(player)).is.true;
    game.addCity(player2, game.board.getSpaceOrThrow(SpaceName.GANYMEDE_COLONY));
    expect(game.board.getSpaceOrThrow(SpaceName.GANYMEDE_COLONY).tile?.tileType).eq(TileType.CITY);
    const tr = player.terraformRating;
    card.play(player);
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 1);
    expect(dirigibles.resourceCount).eq(4);
  });
});
