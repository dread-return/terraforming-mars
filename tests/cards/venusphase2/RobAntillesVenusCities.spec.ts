import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions, setVenusScaleLevel} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {CardName} from '../../../src/common/cards/CardName';
import {VenusPhase2Expansion} from '../../../src/server/venus2/VenusPhase2Expansion';
import {NamedVenusSpaces} from '../../../src/common/venus2/NamedVenusSpaces';
import {CloudCity} from '../../../src/server/cards/robantilles/CloudCity';
import {TroposphericCity} from '../../../src/server/cards/robantilles/TroposphericCity';
import {Dirigibles} from '../../../src/server/cards/venusNext/Dirigibles';

describe('Rob Antilles Venus cities (Venus Phase 2)', () => {
  it('join the deck only with Venus Phase 2', () => {
    const inDeck = (game: ReturnType<typeof testGame>[0]) =>
      [...game.projectDeck.drawPile, ...game.players.flatMap((p) => p.dealtProjectCards)].map((c) => c.name);
    const [without] = testGame(2, {robAntillesExpansion: true, venusNextExtension: true});
    expect(inDeck(without)).does.not.include(CardName.CLOUD_CITY_RA);
    const [withVenus] = testGame(2, {robAntillesExpansion: true, venusNextExtension: true, venusPhase2Expansion: true});
    expect(inDeck(withVenus)).includes(CardName.CLOUD_CITY_RA);
    expect(inDeck(withVenus)).includes(CardName.TROPOSPHERIC_CITY);
  });

  it('Cloud City: 12% Venus, a city on a non-Gas-Mine Venus space, floater action and VP', () => {
    const [game, player] = testGame(2, {robAntillesExpansion: true, venusNextExtension: true, venusPhase2Expansion: true});
    const card = new CloudCity();
    expect(card.canPlay(player)).is.false;
    setVenusScaleLevel(game, 12);
    expect(card.canPlay(player)).is.true;
    player.playCard(card);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    expect(select.spaces.some((s) => s.spaceType === SpaceType.VENUS_GAS_MINE)).is.false;
    expect(select.spaces.map((s) => s.id)).does.not.include(NamedVenusSpaces.STRATOPOLIS);
    select.cb(select.spaces[0]);
    runAllActions(game);
    expect(select.spaces[0].tile?.tileType).eq(TileType.CITY);
    expect(game.board.getCitiesOffMars(player)).has.length(1);
    // City doesn't raise Venus.
    expect(game.getVenusScaleLevel()).eq(12);

    const dirigibles = new Dirigibles();
    player.playedCards.push(dirigibles);
    card.action(player);
    runAllActions(game);
    expect(dirigibles.resourceCount).eq(2);
    expect(card.getVictoryPoints(player)).eq(1);
  });

  it('Tropospheric City: a city on Venus, 1 VP per 2 Venus tags', () => {
    const [game, player] = testGame(2, {robAntillesExpansion: true, venusNextExtension: true, venusPhase2Expansion: true});
    const card = new TroposphericCity();
    player.playCard(card);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectSpace).cb(VenusPhase2Expansion.board(game).getSpaceOrThrow('v02'));
    expect(VenusPhase2Expansion.cities(game)).has.length(1);
    player.tagsForTest = {venus: 4};
    expect(card.getVictoryPoints(player)).eq(2);
  });
});
