import {expect} from 'chai';
import {testGame} from '../TestGame';
import {TestPlayer} from '../TestPlayer';
import {IGame} from '../../src/server/IGame';
import {runAllActions, addOcean, addCity, setRulingParty} from '../TestingUtils';
import {cast} from '../../src/common/utils/utils';
import {CardName} from '../../src/common/cards/CardName';
import {CardType} from '../../src/common/cards/CardType';
import {CardResource} from '../../src/common/CardResource';
import {Tag} from '../../src/common/cards/Tag';
import {PartyName} from '../../src/common/turmoil/PartyName';
import {ColonyName} from '../../src/common/colonies/ColonyName';
import {SpaceName} from '../../src/common/boards/SpaceName';
import {TileType} from '../../src/common/TileType';
import {Mercury} from '../../src/server/mercury/Mercury';
import {isActCard} from '../../src/server/mercury/ActCard';
import {MERCURY_CARD_MANIFEST} from '../../src/server/cards/mercury/MercuryCardManifest';
import {CardManifest} from '../../src/server/cards/ModuleManifest';
import {ICard, isIActionCard} from '../../src/server/cards/ICard';
import {IProjectCard} from '../../src/server/cards/IProjectCard';
import {PlayerInput} from '../../src/server/PlayerInput';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectCard} from '../../src/server/inputs/SelectCard';
import {SelectPlayer} from '../../src/server/inputs/SelectPlayer';
import {SelectAmount} from '../../src/server/inputs/SelectAmount';
import {SelectSpace} from '../../src/server/inputs/SelectSpace';
import {SharedCity} from '../../src/server/cards/mercury/SharedCity';
import {HELD_OUT_ACTS} from '../../src/common/mercury/MercuryCards';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {Game} from '../../src/server/Game';
import {TechnologyAcquisition} from '../../src/server/cards/mercury/TechnologyAcquisition';
import {CloudGenerator} from '../../src/server/cards/postludes/CloudGenerator';
import {SelectColony} from '../../src/server/inputs/SelectColony';
import {SelectResource} from '../../src/server/inputs/SelectResource';
import {SelectOption} from '../../src/server/inputs/SelectOption';
import {SelectParty} from '../../src/server/inputs/SelectParty';
import {AndOptions} from '../../src/server/inputs/AndOptions';
import {Tardigrades} from '../../src/server/cards/base/Tardigrades';
import {Birds} from '../../src/server/cards/base/Birds';
import {Dirigibles} from '../../src/server/cards/venusNext/Dirigibles';

/** Answers whatever `input` asks with its first choice. */
function answer(input: PlayerInput): void {
  if (input instanceof OrOptions) {
    answer(input.options[0]);
    input.cb(undefined);
  } else if (input instanceof SelectOption) {
    input.cb(undefined);
  } else if (input instanceof SelectCard) {
    const n = Math.max(1, input.config.min);
    input.cb(input.cards.slice(0, n));
  } else if (input instanceof SelectPlayer) {
    input.cb(input.players[0]);
  } else if (input instanceof SelectAmount) {
    input.cb(input.max);
  } else if (input instanceof SelectSpace) {
    input.cb(input.spaces[0]);
  } else if (input instanceof SelectColony) {
    input.cb(input.colonies[0]);
  } else if (input instanceof SelectResource) {
    input.cb(input.include[0]);
  } else if (input instanceof SelectParty) {
    input.cb(input.parties[0]);
  } else if (input instanceof AndOptions) {
    input.options.forEach(answer);
    input.cb(undefined);
  } else {
    throw new Error('Cannot answer ' + input.constructor.name);
  }
}

/** Runs the queue and answers every question, for every player, until nothing is asked. */
function settle(game: IGame): void {
  for (let i = 0; i < 100; i++) {
    runAllActions(game);
    const waiting = game.players.find((p) => p.getWaitingFor() !== undefined) as TestPlayer | undefined;
    if (waiting === undefined) {
      return;
    }
    answer(waiting.popWaitingFor()!);
  }
  throw new Error('Too many questions');
}

function rich(player: TestPlayer) {
  player.megaCredits = 200;
  player.steel = 20;
  player.titanium = 20;
  player.plants = 20;
  player.energy = 20;
  player.heat = 20;
  player.production.override({megacredits: 5, steel: 3, titanium: 3, plants: 3, energy: 3, heat: 3});
}

describe('Mercury vs Mars cards', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  beforeEach(() => {
    [game, player, player2] = testGame(3, {mercuryExpansion: true, venusNextExtension: true, pathfindersExpansion: true});
    // Mercury tags, a free trade fleet, cities, oceans and colonies, so most requirements are met.
    for (const p of game.players as Array<TestPlayer>) {
      rich(p);
      p.playedCards.push(new Tardigrades(), new Birds(), new Dirigibles());
    }
    addOcean(player);
    addCity(player);
    addCity(player2);
  });

  const all: Array<[CardName, ICard]> = [];
  for (const [name, spec] of CardManifest.entries(MERCURY_CARD_MANIFEST.projectCards)) {
    all.push([name, new spec.Factory()]);
  }

  for (const [name, card] of all.filter(([, c]) => !isActCard(c))) {
    it(`plays ${name} without errors`, () => {
      if (card.type === CardType.EVENT || card.type === CardType.AUTOMATED || card.type === CardType.ACTIVE) {
        player.playCard(card as IProjectCard);
        settle(game);
        if (isIActionCard(card) && card.canAct(player)) {
          player.defer(card.action(player));
          settle(game);
        }
      }
    });
  }

  for (const [name, card] of all.filter(([, c]) => isActCard(c))) {
    it(`resolves the Act ${name} without errors`, () => {
      if (!isActCard(card)) {
        return;
      }
      player.actCardsInHand.push(card);
      const dev = Mercury.startDevelopment(card, player, player2)!;
      Mercury.addAssets(player, dev, 0, card.steps[0]);
      settle(game);
      expect(game.mercury?.developments).is.empty;
      expect(player.playedCards.has(name)).is.true;
    });
  }

  it('corporations and preludes play without errors', () => {
    for (const spec of CardManifest.values(MERCURY_CARD_MANIFEST.corporationCards)) {
      const [g, p] = testGame(2, {mercuryExpansion: true});
      p.playCorporationCard(new spec.Factory());
      settle(g);
    }
    for (const spec of CardManifest.values(MERCURY_CARD_MANIFEST.preludeCards)) {
      const [g, p] = testGame(2, {mercuryExpansion: true});
      p.playCard(new spec.Factory());
      settle(g);
    }
  });

  it('Solar Research: a Mercury tag gives energy production or a science resource (2 VP each)', () => {
    const SolarResearch = MERCURY_CARD_MANIFEST.projectCards[CardName.SOLAR_RESEARCH]!.Factory;
    const solar = new SolarResearch();
    player.playedCards.push(solar);
    player.playCard(new (MERCURY_CARD_MANIFEST.projectCards[CardName.MERCURY_ADMINISTRATOR]!.Factory)());
    runAllActions(game);
    // Two Mercury tags: two choices.
    for (let i = 0; i < 2; i++) {
      const choice = player.popWaitingFor() as OrOptions;
      choice.options[1].cb(undefined);
      runAllActions(game);
    }
    expect(solar.resourceCount).eq(2);
    expect(solar.getVictoryPoints(player)).eq(4);
  });

  it('Flora Experiments places a greenery on the Shadow Forest without raising oxygen', () => {
    const oxygen = game.getOxygenLevel();
    player.playCard(new (MERCURY_CARD_MANIFEST.projectCards[CardName.FLORA_EXPERIMENTS]!.Factory)());
    settle(game);
    expect(game.board.getSpaceOrThrow(SpaceName.SHADOW_FOREST).tile?.tileType).eq(TileType.GREENERY);
    expect(game.getOxygenLevel()).eq(oxygen);
  });

  it('Party requirements: Mars First ruling or 2 delegates', () => {
    const card = new (MERCURY_CARD_MANIFEST.projectCards[CardName.PREFERENTIAL_GOVERNMENT_CONTRACTS]!.Factory)();
    setRulingParty(game, PartyName.GREENS);
    expect(player.canPlay(card)).is.false;
    setRulingParty(game, PartyName.MARS);
    expect(player.canPlay(card)).is.true;
  });

  it('Kelvinists and Mars First bonuses count Mercury and Mars tags', () => {
    const kelvinists = game.turmoil!.getPartyByName(PartyName.KELVINISTS);
    const bonus = kelvinists.bonuses[0];
    const before = bonus.getScore(player);
    player.playedCards.push(new (MERCURY_CARD_MANIFEST.projectCards[CardName.MERCURY_ADMINISTRATOR]!.Factory)());
    expect(bonus.getScore(player)).eq(before + 2);
    const marsFirst = game.turmoil!.getPartyByName(PartyName.MARS).bonuses[0];
    const mars = marsFirst.getScore(player);
    player.playedCards.push(new (MERCURY_CARD_MANIFEST.projectCards[CardName.TERRAFORMING_EXPERIENCE]!.Factory)());
    expect(marsFirst.getScore(player)).eq(mars + 1);
  });

  it('Hephaestus Works: steel pays for Mercury cards and space events', () => {
    const works = new (MERCURY_CARD_MANIFEST.corporationCards[CardName.HEPHAESTUS_WORKS]!.Factory)();
    player.playedCards.push(works);
    const options = player.affordOptionsForCard(new (MERCURY_CARD_MANIFEST.projectCards[CardName.MERCURY_ADMINISTRATOR]!.Factory)());
    expect(options.steel).is.true;
    expect(player.affordOptionsForCard(new (MERCURY_CARD_MANIFEST.projectCards[CardName.RARE_ASTEROID_HUNTING]!.Factory)()).steel).is.true;
    expect(player.affordOptionsForCard(new (MERCURY_CARD_MANIFEST.projectCards[CardName.DEFENCE_FLEET]!.Factory)()).steel).is.false;
  });

  it('Hephaestus Nets asteroids pay for a trade', () => {
    const nets = new (MERCURY_CARD_MANIFEST.projectCards[CardName.HEPHAESTUS_NETS]!.Factory)();
    player.playedCards.push(nets);
    nets.resourceCount = 2;
    const traders = Mercury.colonyTraders(player);
    expect(traders).to.have.length(1);
    const colony = game.colonies.find((c) => c.name !== ColonyName.MARKET_COLONIES)!;
    traders[0].trade(colony);
    settle(game);
    expect(nets.resourceCount).eq(0);
  });

  it('Spires of Venus collects data when anyone raises Venus', () => {
    const spires = new (MERCURY_CARD_MANIFEST.projectCards[CardName.SPIRES_OF_VENUS]!.Factory)();
    player.playedCards.push(spires);
    game.increaseVenusScaleLevel(player2, 2);
    settle(game);
    expect(player.getResourceCount(CardResource.DATA)).eq(2);
  });

  it('Mercury tags count for Daedalus', () => {
    player.playedCards.push(new (MERCURY_CARD_MANIFEST.projectCards[CardName.MERCURY_ADMINISTRATOR]!.Factory)());
    expect(player.tags.count(Tag.MERCURY, 'award')).eq(2);
  });

  it('a Mercurial Base develops an Act without agreement and adds 4 assets', () => {
    player.actCardsInHand = [];
    const fund = new (MERCURY_CARD_MANIFEST.projectCards[CardName.ZERO_GRAVITY_RACING]!.Factory)();
    if (!isActCard(fund)) {
      throw new Error('not an act');
    }
    player.actCardsInHand.push(fund);
    player.playCard(new (MERCURY_CARD_MANIFEST.preludeCards[CardName.MERCURIAL_BASE]!.Factory)());
    settle(game);
    expect(player.playedCards.has(CardName.ZERO_GRAVITY_RACING) || game.mercury!.developments.some((d) => d.progress[0] === 4)).is.true;
  });
});

describe('Shared City', () => {
  it('is in the Act deck', () => {
    expect(HELD_OUT_ACTS.has(CardName.SHARED_CITY)).is.false;
  });

  it('places a city both players own, which each scores only for greeneries that are not their own', () => {
    const [game, player, player2, player3] = testGame(3, {mercuryExpansion: true});
    const card = new SharedCity();
    card.resolveTreaty(player, player2);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const space = select.spaces.find((s) => game.board.getAdjacentSpaces(s).filter((a) => a.spaceType === SpaceType.LAND && a.tile === undefined).length >= 3)!;
    select.cb(space);
    runAllActions(game);
    expect(space.player).eq(player);
    expect(space.coOwner).eq(player2);
    expect(space.tile?.card).eq(CardName.SHARED_CITY);
    expect(game.board.getCities(player2)).to.include(space);

    const free = game.board.getAdjacentSpaces(space).filter((a) => a.spaceType === SpaceType.LAND && a.tile === undefined);
    game.simpleAddTile(player, free[0], {tileType: TileType.GREENERY});
    game.simpleAddTile(player2, free[1], {tileType: TileType.GREENERY});
    game.simpleAddTile(player3, free[2], {tileType: TileType.GREENERY});
    // Each owner: 2 greeneries next to it aren't theirs.
    expect(player.getVictoryPoints().city).eq(2);
    expect(player2.getVictoryPoints().city).eq(2);
    expect(player3.getVictoryPoints().city).eq(0);
  });

  it('survives a save and reload', () => {
    const [game, player, player2] = testGame(2, {mercuryExpansion: true});
    new SharedCity().resolveTreaty(player, player2);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    runAllActions(game);
    const restored = Game.deserialize(JSON.parse(JSON.stringify(game.serialize())));
    const again = restored.board.getSpaceOrThrow(space.id);
    expect(again.tile?.card).eq(CardName.SHARED_CITY);
    expect(again.coOwner?.id).eq(player2.id);
  });
});

describe('Technology Acquisition', () => {
  it('does not offer a stolen postlude that has nowhere to be placed', () => {
    const [game, victor, defeated] = testGame(2, {mercuryExpansion: true, postludesExpansion: true});
    const act = new TechnologyAcquisition();
    // Cloud Generator needs an ocean to sit on and there are none.
    defeated.playedCards.push(new CloudGenerator());

    act.victory(victor, defeated);
    runAllActions(game);

    expect(victor.popWaitingFor()).is.undefined;
  });
});
