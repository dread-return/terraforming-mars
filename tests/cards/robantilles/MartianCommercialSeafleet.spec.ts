import {expect} from 'chai';
import {MartianCommercialSeafleet} from '../../../src/server/cards/robantilles/MartianCommercialSeafleet';
import {testGame} from '../../TestGame';
import {maxOutOceans} from '../../TestingUtils';
import {SpaceType} from '../../../src/common/boards/SpaceType';

describe('MartianCommercialSeafleet', () => {
  it('pays 2 M€ per city connected to another city through oceans', () => {
    const card = new MartianCommercialSeafleet();
    const [game, player, player2] = testGame(2);
    const [ocean] = maxOutOceans(player, 1);
    // Two land spaces next to the ocean that aren't next to each other.
    const lands = game.board.getAdjacentSpaces(ocean).filter((s) => s.spaceType === SpaceType.LAND && s.tile === undefined);
    const first = lands[0];
    const second = lands.find((s) => s !== first && !game.board.getAdjacentSpaces(first).includes(s))!;
    game.addCity(player, first);
    expect(MartianCommercialSeafleet.connectedCities(player)).eq(0);
    game.addCity(player2, second);
    expect(MartianCommercialSeafleet.connectedCities(player)).eq(1);
    player.steel = 1;
    player.megaCredits = 0; // Ignore the ocean adjacency bonus from placing the cities.
    card.action(player);
    expect(player.steel).eq(0);
    expect(player.megaCredits).eq(2);
  });
});
