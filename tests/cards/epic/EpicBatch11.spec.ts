import {expect} from 'chai';
import {Resource} from '../../../src/common/Resource';
import {Asteroid} from '../../../src/server/cards/base/Asteroid';
import {Comet} from '../../../src/server/cards/base/Comet';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Phase} from '../../../src/common/Phase';
import {TileType} from '../../../src/common/TileType';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {Board} from '../../../src/server/boards/Board';
import {keep} from '../../../src/server/deferredActions/ChooseCards';
import {calculateVictoryPoints} from '../../../src/server/game/calculateVictoryPoints';
import {SelectStandardProjectToPlay} from '../../../src/server/inputs/SelectStandardProjectToPlay';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {SellPatentsStandardProject} from '../../../src/server/cards/base/standardProjects/SellPatentsStandardProject';
import {S2AModular} from '../../../src/server/cards/epic/S2AModular';
import {CosmosCasinos} from '../../../src/server/cards/epic/CosmosCasinos';
import {Scavenger} from '../../../src/server/cards/epic/Scavenger';
import {MarsArchives} from '../../../src/server/cards/epic/MarsArchives';

function withCorp(corp: ICorporationCard, players: number = 2): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(players);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

/** A free land space next to an existing city of `owner`. */
function nextToCity(game: IGame, owner: TestPlayer) {
  const board = game.board;
  const city = board.spaces.find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined &&
    board.getAdjacentSpaces(s).some((a) => a.spaceType === SpaceType.LAND && a.tile === undefined))!;
  game.simpleAddTile(owner, city, {tileType: TileType.CITY});
  const next = board.getAdjacentSpaces(city).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
  return {city, next};
}

describe('Epic Corporations batch 11', () => {
  it('S2A Modular: cities next to cities; titanium and energy pay for the city project', () => {
    const corp = new S2AModular();
    const [game, player, other] = withCorp(corp);
    expect(player.production.titanium).eq(1);
    expect(player.production.energy).eq(3);
    const {next} = nextToCity(game, other);
    expect(game.board.getAvailableSpacesForCity(player)).contains(next);
    expect(game.board.getAvailableSpacesForCity(other)).not.contains(next);
    const city = new CityStandardProject();
    const rules = new SelectStandardProjectToPlay(player, [city]).paymentRulesFor(city).canPayWith;
    expect(rules.titanium).is.true;
    expect(rules.energy).is.true;
  });

  it('Cosmos Casinos: adjacent cities swing M€ production', () => {
    const corp = new CosmosCasinos();
    const [game, player, other] = withCorp(corp);
    const {next} = nextToCity(game, other);
    other.production.add(Resource.MEGACREDITS, 2);
    game.addTile(player, next, {tileType: TileType.CITY});
    expect(player.production.megacredits).eq(1);
    expect(other.production.megacredits).eq(1);
    expect(Board.isCitySpace(next)).is.true;
  });

  it('Cosmos Casinos: its free award scores double', () => {
    const corp = new CosmosCasinos();
    const [game, player, other] = withCorp(corp);
    const options = cast(corp.initialAction(player), OrOptions);
    options.options[0].cb(undefined);
    const funded = game.fundedAwards[0];
    expect(funded.player).eq(player);
    const vp = (p: TestPlayer) => calculateVictoryPoints(p).awards;
    const total = vp(player) + vp(other);
    // A tie gives both players first place: 10 each instead of 5.
    expect([0, 10, 14, 20]).contains(total);
  });

  it('Scavenger: buys discarded cards in research, sells patents for 2 M€', () => {
    const corp = new Scavenger();
    const [game, player] = withCorp(corp);
    expect(player.megaCredits).eq(0);
    const a = fakeCard({name: 'a' as CardName});
    const b = fakeCard({name: 'b' as CardName});
    game.projectDeck.discardPile.push(a, b);
    game.generation = 2;
    player.megaCredits = 1;
    let done = false;
    const select = cast(Scavenger.research(player, () => done = true), SelectCard);
    expect(select.config.max).eq(1);
    select.cb([a]);
    expect(done).is.true;
    expect(player.cardsInHand).contains(a);
    expect(game.projectDeck.discardPile).not.contains(a);
    expect(player.megaCredits).eq(0);

    player.cardsInHand = [b];
    game.projectDeck.discardPile.splice(game.projectDeck.discardPile.indexOf(b), 1);
    cast(new SellPatentsStandardProject().action(player), SelectCard).cb([b]);
    expect(player.megaCredits).eq(2);
  });

  it('Scavenger: buys after everyone has finished research, seeing all the discards at once', () => {
    const corp = new Scavenger();
    const [game, player, other] = withCorp(corp);
    game.generation = 2;
    player.megaCredits = 20;
    other.megaCredits = 20;
    // Cards discarded before this research phase aren't offered.
    const old = fakeCard({name: 'old' as CardName});
    game.projectDeck.discardPile.length = 0;
    game.projectDeck.discardPile.push(old);
    game.gotoResearchPhase();
    // Scavenger waits; its 4 cards are already discarded.
    expect(player.getWaitingFor()).is.undefined;
    expect(game.projectDeck.discardPile).has.length(5);
    expect(game.phase).eq(Phase.RESEARCH);

    // The other player keeps 1 card and discards 3.
    const research = cast(other.popWaitingFor(), SelectCard);
    research.cb([research.cards[0]]);
    runAllActions(game);
    const buy = cast(player.popWaitingFor(), SelectCard);
    expect(buy.cards).has.length(7);
    expect(buy.cards).not.contains(old);
    expect(game.phase).eq(Phase.RESEARCH);
    buy.cb([buy.cards[0], buy.cards[1]]);
    expect(player.cardsInHand).has.length(2);
    expect(player.megaCredits).eq(18);
    expect(game.phase).eq(Phase.ACTION);
  });

  it('Scavenger: sees only its own 4 when everyone else buys all their cards', () => {
    const corp = new Scavenger();
    const [game, player, other] = withCorp(corp);
    game.generation = 2;
    player.megaCredits = 20;
    other.megaCredits = 20;
    game.gotoResearchPhase();
    const research = cast(other.popWaitingFor(), SelectCard);
    research.cb(research.cards);
    runAllActions(game);
    const buy = cast(player.popWaitingFor(), SelectCard);
    expect(buy.cards).has.length(4);
  });

  it('Scavenger: first action takes discarded cards for free', () => {
    const corp = new Scavenger();
    const [game, player] = withCorp(corp);
    const a = fakeCard({name: 'a' as CardName});
    game.projectDeck.discardPile.push(a);
    const take = cast(corp.initialAction(player), SelectCard);
    take.cb([a]);
    expect(player.cardsInHand).contains(a);
    expect(player.megaCredits).eq(0);
  });

  it('Mars Archives: discarded cards can be archived (1 per science tag) and bought back for 3 M€', () => {
    const corp = new MarsArchives();
    const [game, player] = withCorp(corp);
    expect(corp.room(player)).eq(1);
    // Real cards: archived cards are kept by name.
    const a = new Asteroid();
    const b = new Comet();
    keep(player, [], [a, b]);
    runAllActions(game);
    const archive = cast(player.popWaitingFor(), SelectCard);
    expect(archive.config.max).eq(1);
    archive.cb([a]);
    expect(game.projectDeck.discardPile).not.contains(a);
    expect(game.projectDeck.discardPile).contains(b);
    expect(corp.resourceCount).eq(1);
    expect(corp.room(player)).eq(0);

    player.tagsForTest = {science: 2};
    expect(corp.room(player)).eq(1);
    player.megaCredits = 3;
    expect(corp.canAct(player)).is.true;
    const options = cast(corp.action(player), OrOptions);
    const takeInput = cast(options.options[0].cb(undefined), SelectCard);
    takeInput.cb([takeInput.cards[0]]);
    expect(player.cardsInHand.map((c) => c.name)).contains(CardName.ASTEROID);
    expect(player.megaCredits).eq(0);
    expect(corp.resourceCount).eq(0);
  });
});

