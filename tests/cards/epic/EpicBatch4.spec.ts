import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {addCity, addGreenery, addOcean, fakeCard, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';
import {Phase} from '../../../src/common/Phase';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {Board} from '../../../src/server/boards/Board';
import {AerospaceAlloys} from '../../../src/server/cards/epic/AerospaceAlloys';
import {Amityville} from '../../../src/server/cards/epic/Amityville';
import {Bentenmaru} from '../../../src/server/cards/epic/Bentenmaru';
import {ELM} from '../../../src/server/cards/epic/ELM';
import {FirstWave} from '../../../src/server/cards/epic/FirstWave';
import {Futura} from '../../../src/server/cards/epic/Futura';
import {GAIA} from '../../../src/server/cards/epic/GAIA';
import {HeindlAquatic} from '../../../src/server/cards/epic/HeindlAquatic';
import {MiMix} from '../../../src/server/cards/epic/MiMix';
import {NewGrounds} from '../../../src/server/cards/epic/NewGrounds';
import {PlanetForge} from '../../../src/server/cards/epic/PlanetForge';
import {PlanetWave} from '../../../src/server/cards/epic/PlanetWave';
import {PlutonicPrototyping} from '../../../src/server/cards/epic/PlutonicPrototyping';
import {Schlockmeister} from '../../../src/server/cards/epic/Schlockmeister';
import {SpaceGuild} from '../../../src/server/cards/epic/SpaceGuild';
import {StJosephOfCupertinoMissionEpic} from '../../../src/server/cards/epic/StJosephOfCupertinoMissionEpic';
import {SteelRidgeConstructions} from '../../../src/server/cards/epic/SteelRidgeConstructions';
import {RosenburgInitiative} from '../../../src/server/cards/epic/RosenburgInitiative';
import {Payment} from '../../../src/common/inputs/Payment';
import {GameSetup} from '../../../src/server/GameSetup';
import {TileType} from '../../../src/common/TileType';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 4', () => {
  it('Aerospace Alloys: titanium waits on the card until 10, then moves to stock, and the card fills up again', () => {
    const card = new AerospaceAlloys();
    const [, player] = withCorp(card);
    expect(player.getTitaniumValue()).eq(4);
    player.stock.add(Resource.TITANIUM, 6);
    expect(player.titanium).eq(0);
    expect(card.resourceCount).eq(6);
    player.stock.add(Resource.TITANIUM, 5);
    expect(player.titanium).eq(10);
    expect(card.resourceCount).eq(1);
    player.stock.add(Resource.TITANIUM, 1);
    expect(player.titanium).eq(10);
    expect(card.resourceCount).eq(2);
    player.stock.add(Resource.TITANIUM, 18);
    expect(player.titanium).eq(30);
    expect(card.resourceCount).eq(0);
  });

  it('Amityville: plants removed from others can be gained', () => {
    const [game, player, other] = withCorp(new Amityville());
    other.plants = 5;
    other.stock.deduct(Resource.PLANTS, 3, {from: {player}});
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(player.plants).eq(3);
  });

  it('Bentenmaru: attacks raise it instead; passing discards M€', () => {
    const [, player, other] = withCorp(new Bentenmaru());
    player.plants = 4;
    player.stock.deduct(Resource.PLANTS, 2, {log: false, from: {player: other}});
    expect(player.plants).eq(6);
    player.production.add(Resource.MEGACREDITS, -1, {log: false, from: {player: other}});
    expect(player.production.megacredits).eq(11);
    player.megaCredits = 20;
    EpicHooks.onPass(player);
    expect(player.megaCredits).eq(0);
  });

  it('ELM: Earth tags add influence, spendable for 2 M€ each', () => {
    const elm = new ELM();
    const [, player, other] = withCorp(elm);
    other.playCard(fakeCard({name: 'e' as CardName, tags: [Tag.EARTH]}));
    expect(elm.resourceCount).eq(2);
    const mc = player.megaCredits;
    const option = cast(EpicHooks.freeActionOption(player), OrOptions).options[0];
    option.cb()!.cb(2);
    expect(player.megaCredits).eq(mc + 4);
  });

  it('First Wave: the first 4 setup cards are free', () => {
    const [game, player] = testGame(2);
    player.cardsInHand.push(...game.projectDeck.drawN(game, 6));
    player.playCorporationCard(new FirstWave());
    expect(player.megaCredits).eq(10 - 2 * 3);
    expect(player.terraformRating).eq(21);
  });

  it('Futura: standard projects are cheaper and give an extra action', () => {
    const [game, player] = withCorp(new Futura());
    const city = game.standardProjects.find((sp) => sp.name === CardName.CITY_STANDARD_PROJECT)!;
    expect(city.getAdjustedCost(player)).eq(23);
    player.megaCredits = 30;
    city.payAndExecute(player, Payment.of({megacredits: 23}));
    expect(player.freeActionTaken).is.true;
  });

  it('G-AI-A: protects plants and gains science from tags', () => {
    const gaia = new GAIA();
    const [, player, other] = withCorp(gaia);
    expect(player.plantsAreProtected()).is.true;
    other.playCard(fakeCard({name: 'p' as CardName, tags: [Tag.PLANT, Tag.SCIENCE]}));
    expect(gaia.resourceCount).eq(2 + 1 + 2);
  });

  it('HeindlAquatic: oceans next to its greenery raise plant production', () => {
    const [game, player] = withCorp(new HeindlAquatic());
    const greenery = addGreenery(player);
    const next = game.board.getAdjacentSpaces(greenery).find((s) => s.spaceType === SpaceType.OCEAN && s.tile === undefined);
    if (next !== undefined) {
      addOcean(player, next.id);
      expect(player.production.plants).eq(1);
    }
  });

  it('MiMix: greeneries raise its microbe production', () => {
    const mimix = new MiMix();
    const [, player, other] = withCorp(mimix);
    addGreenery(other);
    expect(mimix.data.production).eq(1);
    mimix.onProductionPhase(player);
    expect(mimix.resourceCount).eq(1);
  });

  it('New Grounds: cities next to cities; Steel Ridge: normal city rules and 4 steel', () => {
    for (const [corp, allowed] of [[new NewGrounds(), true], [new SteelRidgeConstructions(), false]] as const) {
      const [game, player] = withCorp(corp);
      const city = addCity(player);
      const next = game.board.getAdjacentSpaces(city).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
      expect(game.board.getAvailableSpacesForCity(player).includes(next)).eq(allowed);
    }
    const [, player] = withCorp(new SteelRidgeConstructions());
    expect(player.steel).eq(4);
  });

  it('Steel Ridge: city cards and the city project cost 3 less', () => {
    const [game, player] = withCorp(new SteelRidgeConstructions());
    expect(player.getCardCost(fakeCard({name: 'c' as CardName, tags: [Tag.CITY], cost: 10}))).eq(7);
    const city = game.standardProjects.find((sp) => sp.name === CardName.CITY_STANDARD_PROJECT)!;
    expect(city.getAdjustedCost(player)).eq(22);
  });

  it('Planet Forge and Plutonic Prototyping: steel and titanium for more cards', () => {
    const [, forge] = withCorp(new PlanetForge());
    expect(EpicHooks.canUseSteel(forge, fakeCard({tags: [Tag.VENUS]}))).is.true;
    expect(EpicHooks.canUseTitanium(forge, fakeCard({tags: [Tag.VENUS]}))).is.true;
    const [, plutonic] = withCorp(new PlutonicPrototyping());
    expect(EpicHooks.canUseSteel(plutonic, fakeCard({tags: [Tag.SPACE]}))).is.true;
    expect(EpicHooks.canUseTitanium(plutonic, fakeCard({tags: [Tag.BUILDING]}))).is.true;
    expect(EpicHooks.canUseTitanium(plutonic, fakeCard({tags: [Tag.PLANT]}))).is.false;
  });

  it('Planet Wave: oceans count as its tiles for greenery placement', () => {
    const [game, player] = withCorp(new PlanetWave());
    const ocean = addOcean(player);
    const next = game.board.getAdjacentSpaces(ocean).find((s) => s.spaceType === SpaceType.LAND && s.tile === undefined)!;
    expect(game.board.getAvailableSpacesForGreenery(player)).includes(next);
    expect(player.oceanBonus).eq(4);
  });

  it('Schlockmeister: may raise M€ production for a deficit', () => {
    const schlock = new Schlockmeister();
    const [game, player] = withCorp(schlock);
    player.production.add(Resource.STEEL, 1);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(player.production.megacredits).eq(1);
    expect(schlock.resourceCount).eq(1);
    schlock.resourceCount = 6;
    expect(schlock.getVictoryPoints()).eq(-2);
  });

  it('Space Guild: event tags count; an event can be discarded to trade', () => {
    const guild = new SpaceGuild();
    const [, player] = withCorp(guild, {coloniesExtension: true});
    const event = fakeCard({name: 'ev' as CardName, type: CardType.EVENT, tags: [Tag.SPACE]});
    player.playedCards.push(event);
    expect(player.tags.count(Tag.SPACE, 'raw')).eq(2);
    expect(guild.canAct(player)).is.true;
    const select = cast(guild.action(player), SelectCard);
    const colonies = select.cb([event]);
    expect(colonies).is.not.undefined;
    expect(player.playedCards.has(event.name)).is.false;
  });

  it('St. Joseph: temples give cards, production and VP', () => {
    const joseph = new StJosephOfCupertinoMissionEpic();
    const [game, player, other] = withCorp(joseph);
    const city = addCity(other);
    player.megaCredits = 12;
    cast(joseph.action(player), SelectSpace).cb(city);
    runAllActions(game);
    const keepOne = cast(player.popWaitingFor(), SelectCard);
    keepOne.cb([keepOne.cards[0]]);
    expect(player.cardsInHand).has.length(1);
    expect(other.cardsInHand).has.length(1);
    expect(player.production.megacredits).eq(1);
    expect(player.megaCredits).eq(0);
    expect(joseph.getVictoryPoints(player)).gte(1);
  });

  it('St. Joseph: a temple in a neutral city keeps both cards (the neutral player is not a player)', () => {
    const joseph = new StJosephOfCupertinoMissionEpic();
    const [game, player] = withCorp(joseph);
    const city = game.board.getAvailableSpacesForCity(player)[0];
    game.simpleAddTile(GameSetup.neutralPlayerFor(game.id), city, {tileType: TileType.CITY});
    player.megaCredits = 12;
    cast(joseph.action(player), SelectSpace).cb(city);
    runAllActions(game);
    expect(player.popWaitingFor()).is.undefined;
    expect(player.cardsInHand).has.length(2);
    expect(player.production.megacredits).eq(1);
  });

  it('Rosenburg: cubes on greeneries become plants', () => {
    const rosenburg = new RosenburgInitiative();
    const [, player] = withCorp(rosenburg);
    const g = addGreenery(player);
    expect(rosenburg.canAct(player)).is.true;
    cast(rosenburg.action(player), SelectSpace).cb(g);
    expect(rosenburg.data.cubes[g.id]).eq(2);
    rosenburg.onProductionPhase(player);
    expect(player.plants).eq(1);
    expect(Board.isGreenerySpace(g)).is.true;
  });
});
