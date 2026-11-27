import {expect} from 'chai';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {IGame} from '../../src/server/IGame';
import {Game} from '../../src/server/Game';
import {runAllActions, addGreenery} from '../TestingUtils';
import {cast} from '../../src/common/utils/utils';
import {CardName} from '../../src/common/cards/CardName';
import {CardType} from '../../src/common/cards/CardType';
import {CardResource} from '../../src/common/CardResource';
import {ColonyName} from '../../src/common/colonies/ColonyName';
import {TileType} from '../../src/common/TileType';
import {Mercury} from '../../src/server/mercury/Mercury';
import {IActCard, isActCard} from '../../src/server/mercury/ActCard';
import {MercuryColonies} from '../../src/server/mercury/MercuryColonies';
import {newProjectCard} from '../../src/server/createCard';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectCard} from '../../src/server/inputs/SelectCard';
import {SelectPlayer} from '../../src/server/inputs/SelectPlayer';
import {SelectAmount} from '../../src/server/inputs/SelectAmount';
import {SelectColony} from '../../src/server/inputs/SelectColony';
import {AddResourcesToCard} from '../../src/server/deferredActions/AddResourcesToCard';
import {MERCURY_TRACK_MAX, STARTING_RIVALRIES, STARTING_TREATIES} from '../../src/common/mercury/Mercury';
import {HELD_OUT_ACTS} from '../../src/common/mercury/MercuryCards';
import {Tardigrades} from '../../src/server/cards/base/Tardigrades';
import {Hermes} from '../../src/server/cards/mercury/Hermes';
import {GameCards} from '../../src/server/GameCards';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';

function act(name: CardName): IActCard {
  const card = newProjectCard(name);
  if (card === undefined || !isActCard(card)) {
    throw new Error(`${name} is not an Act`);
  }
  return card;
}

function give(player: TestPlayer, name: CardName): IActCard {
  const card = act(name);
  player.actCardsInHand.push(card);
  return card;
}

describe('Mercury vs Mars', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;
  let player3: TestPlayer;

  beforeEach(() => {
    [game, player, player2, player3] = testGame(3, {mercuryExpansion: true});
  });

  it('turns on Colonies and Turmoil, and adds Market Colonies on top of the random colonies', () => {
    expect(game.gameOptions.coloniesExtension).is.true;
    expect(game.gameOptions.turmoilExtension).is.true;
    expect(game.turmoil).is.not.undefined;
    const names = game.colonies.map((c) => c.name);
    expect(names).includes(ColonyName.MARKET_COLONIES);
    // 3 players: 5 random colonies, plus Market Colonies.
    expect(names).to.have.length(6);
  });

  it('deals 2 Treaties and 1 Rivalry to everybody', () => {
    for (const p of [player, player2, player3]) {
      expect(p.actCardsInHand.filter((c) => c.kind === 'treaty')).to.have.length(STARTING_TREATIES);
      expect(p.actCardsInHand.filter((c) => c.kind === 'rivalry')).to.have.length(STARTING_RIVALRIES);
    }
  });

  it('has 55 Acts, and keeps the held ones and the Acts out of the project deck', () => {
    const cards = new GameCards({...DEFAULT_GAME_OPTIONS, mercuryExpansion: true, venusNextExtension: true});
    const acts = cards.getActCards();
    expect(acts).to.have.length(55 - HELD_OUT_ACTS.size);
    expect(acts.filter((c) => c.kind === 'treaty')).to.have.length(32 - 1);
    expect(acts.filter((c) => c.kind === 'rivalry')).to.have.length(23 - 1);
    expect(cards.getProjectCards().some((c) => c.type === CardType.ACT)).is.false;
    expect(cards.getProjectCards().filter((c) => c.name === CardName.SHADY_DEAL)).to.have.length(1);
  });

  it('a Treaty needs the other player to agree, and resolves for both', () => {
    player.actCardsInHand = [];
    const card = give(player, CardName.FUNDRAISING_EVENTS);
    const develop = cast(Mercury.developAction(player), SelectCard);
    develop.cb([card]);
    runAllActions(game);
    const propose = cast(player.popWaitingFor(), OrOptions);
    cast(propose.options[0], SelectPlayer).cb(player2);
    runAllActions(game);
    // player2 declines, so player can ask player3.
    cast(player2.popWaitingFor(), OrOptions).options[1].cb();
    runAllActions(game);
    const again = cast(player.popWaitingFor(), OrOptions);
    const candidates = cast(again.options[0], SelectPlayer).players;
    expect(candidates).deep.eq([player3]);
    cast(again.options[0], SelectPlayer).cb(player3);
    runAllActions(game);
    cast(player3.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);

    expect(game.mercury?.developments).to.have.length(1);
    expect(player.actCardsInHand).is.empty;

    player.megaCredits = 0;
    player3.megaCredits = 0;
    Mercury.gainAssets(player, 4);
    runAllActions(game);
    Mercury.gainAssets(player3, 2);
    runAllActions(game);
    // Fundraising Events needs 6 assets.
    expect(game.mercury?.developments).is.empty;
    expect(player.megaCredits).eq(10);
    expect(player3.megaCredits).eq(10);
    expect(player.playedCards.has(CardName.FUNDRAISING_EVENTS)).is.true;
    expect(player3.playedCards.has(CardName.FUNDRAISING_EVENTS)).is.false;
    // The initiator draws a new Act.
    expect(player.actCardsInHand).to.have.length(1);
  });

  it('a Rivalry goes to the first player to reach the handshake', () => {
    const card = give(player, CardName.SMALL_SPACE_ELEVATOR);
    Mercury.startDevelopment(card, player, player2);
    const tr = player2.terraformRating;
    Mercury.gainAssets(player2, 3);
    runAllActions(game);
    expect(game.mercury?.developments).to.have.length(1);
    Mercury.gainAssets(player, 4);
    runAllActions(game);
    expect(game.mercury?.developments).is.empty;
    expect(player.steel).eq(5);
    expect(player2.terraformRating).eq(tr - 1);
    expect(player.playedCards.has(CardName.SMALL_SPACE_ELEVATOR)).is.true;
  });

  it('a Rivalry can have different lengths for each side', () => {
    const card = give(player, CardName.INEQUALITY_FUND);
    expect(card.steps).deep.eq([4, 5]);
    player2.production.add('megacredits', 5);
    expect(card.canDevelop(player, player2)).is.true;
    expect(card.canDevelop(player2, player)).is.false;
  });

  it('assets are lost without an Act, and split between two Acts', () => {
    Mercury.gainAssets(player, 3);
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;

    const a = give(player, CardName.FUNDRAISING_EVENTS);
    const b = give(player, CardName.ZERO_GRAVITY_RACING);
    const devA = Mercury.startDevelopment(a, player, player2)!;
    const devB = Mercury.startDevelopment(b, player, player3)!;
    expect(Mercury.canTakePart(player)).is.false;
    expect(Mercury.developableActs(player)).is.empty;

    Mercury.gainAssets(player, 4);
    runAllActions(game);
    const amount = cast(player.popWaitingFor(), SelectAmount);
    amount.cb(1);
    runAllActions(game);
    expect(devA.progress[0]).eq(1);
    expect(devB.progress[0]).eq(3);
  });

  it('the Negotiations phase comes before the first action of a generation, once', () => {
    player.actCardsInHand = [];
    give(player, CardName.ZERO_GRAVITY_RACING);
    const input = cast(Mercury.negotiations(player), OrOptions);
    expect(input.options).to.have.length(2);
    expect(Mercury.negotiations(player)).is.undefined;
    Mercury.onGenerationStart(game);
    expect(Mercury.negotiations(player)).is.not.undefined;
  });

  it('Rivalry requirements are checked when the Act goes into development', () => {
    const card = act(CardName.CRATER_RESERVATION_TAX);
    expect(card.canDevelop(player, player2)).is.false;
    player2.playedCards.push(newProjectCard(CardName.MERCURY_ADMINISTRATOR)!);
    expect(card.canDevelop(player, player2)).is.true;
  });

  it('the Mercury track gives its prizes, and 2 VP for the most Mercury tags once finished', () => {
    const cards = player.cardsInHand.length + player2.cardsInHand.length;
    Mercury.raiseTrack(player, 3);
    runAllActions(game);
    // Step 3: everybody draws a card, the raiser gains 1 standard resource.
    expect(player.cardsInHand.length + player2.cardsInHand.length).eq(cards + 2);
    expect(game.mercury?.track).eq(3);

    Mercury.raiseTrack(player, 20);
    runAllActions(game);
    expect(game.mercury?.track).eq(MERCURY_TRACK_MAX);

    player.playedCards.push(newProjectCard(CardName.MERCURY_ADMINISTRATOR)!);
    const vp = player.getVictoryPoints().victoryPoints;
    const vp2 = player2.getVictoryPoints().victoryPoints;
    player.playedCards.push(newProjectCard(CardName.MERCURIAL_METRO)!);
    expect(player.getVictoryPoints().victoryPoints).eq(vp + 1);
    expect(player2.getVictoryPoints().victoryPoints).eq(vp2);
  });

  it('playing a Mercury tag raises the track', () => {
    player.playCard(newProjectCard(CardName.MERCURY_ADMINISTRATOR)!);
    runAllActions(game);
    expect(game.mercury?.track).eq(2);
  });

  it('resources nobody can use go to Market Colonies for assets, but not resources from colonies', () => {
    const card = give(player, CardName.ZERO_GRAVITY_RACING);
    const dev = Mercury.startDevelopment(card, player, player2)!;
    game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: 2}));
    runAllActions(game);
    expect(game.mercury?.market.microbe).eq(2);
    expect(dev.progress[0]).eq(2);

    game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 2, fromColony: true}));
    runAllActions(game);
    expect(game.mercury?.market.floater).eq(0);

    // Animals are not accepted.
    game.defer(new AddResourcesToCard(player, CardResource.ANIMAL, {count: 2}));
    runAllActions(game);
    expect(game.mercury?.market.other).is.empty;
  });

  it('each Market Colonies column holds at most 6', () => {
    expect(Mercury.putOnMarket(player, CardResource.DATA, 5)).eq(5);
    expect(Mercury.putOnMarket(player, CardResource.DATA, 5)).eq(1);
    expect(Mercury.acceptsOnMarket(game, CardResource.DATA)).is.false;
  });

  it('trading with Market Colonies takes up to 3 of one kind', () => {
    Mercury.putOnMarket(player2, CardResource.MICROBE, 5);
    runAllActions(game);
    const tardigrades = new Tardigrades();
    player.playedCards.push(tardigrades);
    const market = game.colonies.find((c) => c.name === ColonyName.MARKET_COLONIES)!;
    market.trade(player);
    runAllActions(game);
    const choice = cast(player.popWaitingFor(), OrOptions);
    choice.options[0].cb();
    runAllActions(game);
    expect(tardigrades.resourceCount).eq(3);
    expect(game.mercury?.market.microbe).eq(2);
  });

  it('influence becomes assets after the Turmoil phase', () => {
    const card = give(player, CardName.ZERO_GRAVITY_RACING);
    const dev = Mercury.startDevelopment(card, player, player2)!;
    game.turmoil!.addInfluenceBonus(player, 2);
    const influence = game.turmoil!.getInfluence(player);
    Mercury.onTurmoilPhaseEnd(game);
    runAllActions(game);
    expect(dev.progress[0]).eq(Math.min(influence, 5));
  });

  it('Boreholes gives an asset to whoever places a tile next to it', () => {
    const card = give(player2, CardName.ZERO_GRAVITY_RACING);
    const dev = Mercury.startDevelopment(card, player2, player)!;
    const space = game.board.getAvailableSpacesOnLand(player).find((s) => s.bonus.length === 0)!;
    game.addTile(player, space, {tileType: TileType.BOREHOLES});
    const next = game.board.getAdjacentSpaces(space).find((s) => game.board.getAvailableSpacesOnLand(player2).includes(s))!;
    addGreenery(player2, next.id);
    runAllActions(game);
    expect(dev.progress[0]).eq(1);
  });

  it('Mercurial Shadow Colony may use the reserved 4th space on Mercury', () => {
    const market = game.colonies.find((c) => c.name === ColonyName.MARKET_COLONIES)!;
    market.colonies.push(player2.id, player3.id, player.id);
    expect(MercuryColonies.placeableOnMercury(player)).not.includes(market);
    expect(MercuryColonies.placeableOnMercury(player, {reservedSpace: true})).includes(market);
    player.playCard(newProjectCard(CardName.MERCURIAL_SHADOW_COLONY)!);
    runAllActions(game);
    const select = player.popWaitingFor();
    if (select !== undefined) {
      cast(select, SelectColony).cb(market);
      runAllActions(game);
    }
    expect(market.colonies).to.have.length(4);
  });

  it('New Pompeii needs 3 colonies on Mercury', () => {
    const card = newProjectCard(CardName.NEW_POMPEII)!;
    player.megaCredits = 100;
    expect(player.canPlay(card)).is.false;
    const market = game.colonies.find((c) => c.name === ColonyName.MARKET_COLONIES)!;
    market.colonies.push(player2.id, player3.id, player.id);
    expect(player.canPlay(card)).is.true;
  });

  it('Seed Sharing: each player also produces the other\'s plant production', () => {
    const card = give(player, CardName.SEED_SHARING_MVM);
    player.production.add('plants', 2);
    player2.production.add('plants', 3);
    const dev = Mercury.startDevelopment(card, player, player2)!;
    Mercury.addAssets(player, dev, 0, 7);
    runAllActions(game);
    Mercury.onProductionPhase(game);
    expect(player.plants).eq(3);
    expect(player2.plants).eq(2);
  });

  it('Tradeship Takeover: a borrowed fleet goes back after the next generation', () => {
    const card = give(player, CardName.TRADESHIP_TAKEOVER);
    const dev = Mercury.startDevelopment(card, player, player2)!;
    Mercury.addAssets(player, dev, 0, 4);
    runAllActions(game);
    expect(player.colonies.getFleetSize()).eq(2);
    expect(player2.colonies.getFleetSize()).eq(0);
    (game as Game).generation += 1;
    Mercury.onGenerationStart(game);
    expect(player.colonies.getFleetSize()).eq(2);
    (game as Game).generation += 1;
    Mercury.onGenerationStart(game);
    expect(player.colonies.getFleetSize()).eq(1);
    expect(player2.colonies.getFleetSize()).eq(1);
  });

  it('Shady Deal adds assets to ANY Act, even one you do not take part in', () => {
    const card = give(player2, CardName.ZERO_GRAVITY_RACING);
    const dev = Mercury.startDevelopment(card, player2, player3)!;
    player.playCard(newProjectCard(CardName.SHADY_DEAL)!);
    runAllActions(game);
    const choice = cast(player.popWaitingFor(), OrOptions);
    // The Rivalry has one option per track.
    expect(choice.options).to.have.length(2);
    choice.options[1].cb();
    runAllActions(game);
    expect(dev.progress[1]).eq(4);
  });

  it('Hermes: any Mercury tag gives 1 M€ production and 1 asset', () => {
    player.playedCards.push(new Hermes());
    const before = player.production.megacredits;
    player2.playCard(newProjectCard(CardName.MERCURY_ADMINISTRATOR)!);
    runAllActions(game);
    expect(player.production.megacredits).eq(before + 2);
  });

  it('Biocomputers discounts building, science and Mercury cards once', () => {
    const bio = newProjectCard(CardName.BIOCOMPUTERS)!;
    player.playedCards.push(bio);
    expect(player.getCardCost(newProjectCard(CardName.MERCURY_ENGINEERING_SCHOOL)!)).eq(14);
    expect(player.getCardCost(newProjectCard(CardName.DEFENCE_FLEET)!)).eq(16);
  });

  it('Hephaestus Nets asteroids pay for Mars and Venus cards', () => {
    const nets = newProjectCard(CardName.HEPHAESTUS_NETS)!;
    player.playedCards.push(nets);
    nets.resourceCount = 2;
    expect(player.getSpendable('hephaestusAsteroids')).eq(2);
    const chain = newProjectCard(CardName.TERRAFORMING_CHAIN)!;
    expect(player.affordOptionsForCard(chain).hephaestusAsteroids).is.true;
    expect(player.affordOptionsForCard(newProjectCard(CardName.DEFENCE_FLEET)!).hephaestusAsteroids).is.false;
  });

  it('serializes and deserializes the Mercury state and Act hands', () => {
    const card = give(player, CardName.ZERO_GRAVITY_RACING);
    const dev = Mercury.startDevelopment(card, player, player2)!;
    Mercury.addAssets(player, dev, 0, 2);
    Mercury.putOnMarket(player, CardResource.FLOATER, 2);
    Mercury.raiseTrack(player, 2);
    runAllActions(game);
    const copy = Game.deserialize(JSON.parse(JSON.stringify((game as Game).serialize())));
    expect(copy.mercury?.developments).to.have.length(1);
    expect(copy.mercury?.developments[0].card.name).eq(CardName.ZERO_GRAVITY_RACING);
    expect(copy.mercury?.track).eq(2);
    expect(copy.mercury?.market.floater).eq(2);
    expect(copy.getPlayerById(player2.id).actCardsInHand.map((c) => c.name)).deep.eq(player2.actCardsInHand.map((c) => c.name));
    expect(copy.colonies.some((c) => c.name === ColonyName.MARKET_COLONIES)).is.true;
  });
});
