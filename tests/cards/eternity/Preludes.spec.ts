import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions, setTemperature} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {TileType} from '../../../src/common/TileType';
import {CardResource} from '../../../src/common/CardResource';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {AcquisitionTarget} from '../../../src/server/cards/eternity/AcquisitionTarget';
import {AnimalsFromHome} from '../../../src/server/cards/eternity/AnimalsFromHome';
import {FloraFaunaAndFunga} from '../../../src/server/cards/eternity/FloraFaunaAndFunga';
import {FlowstoneCave} from '../../../src/server/cards/eternity/FlowstoneCave';
import {GreetingCard} from '../../../src/server/cards/eternity/GreetingCard';
import {JellyfishFarms} from '../../../src/server/cards/eternity/JellyfishFarms';
import {RelativisticReverberation} from '../../../src/server/cards/eternity/RelativisticReverberation';
import {SunkenCity} from '../../../src/server/cards/eternity/SunkenCity';
import {VenusianMicrofauna} from '../../../src/server/cards/eternity/VenusianMicrofauna';
import {CrashingSpaceDebris} from '../../../src/server/cards/eternity/CrashingSpaceDebris';
import {Vipers} from '../../../src/server/cards/eternity/Vipers';
import {ViralAmoeboid} from '../../../src/server/cards/eternity/ViralAmoeboid';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Birds} from '../../../src/server/cards/base/Birds';
import {Fish} from '../../../src/server/cards/base/Fish';
import {CrediCor} from '../../../src/server/cards/corporation/CrediCor';
import {Helion} from '../../../src/server/cards/corporation/Helion';
import {AddResourcesToCard} from '../../../src/server/deferredActions/AddResourcesToCard';
import {CardName} from '../../../src/common/cards/CardName';

describe('Eternity preludes (second batch)', () => {
  let game: IGame;
  let player: TestPlayer;
  let other: TestPlayer;

  beforeEach(() => {
    [game, player, other] = testGame(2, {eternityExpansion: true, preludeExtension: true, venusNextExtension: true});
  });

  it('Acquisition Target swaps your corporation', () => {
    player.playCorporationCard(new CrediCor());
    runAllActions(game);
    const helion = new Helion();
    game.corporationDeck.drawPile.push(helion);
    const mc = player.megaCredits;
    new AcquisitionTarget().play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([helion]);
    runAllActions(game);
    expect(player.playedCards.corporations().map((c) => c.name)).deep.eq([CardName.HELION]);
    expect(player.megaCredits).eq(mc - 57 + 42 + 5);
    expect(player.production.heat).eq(3);
  });

  it('Animals from Home moves its animals onto the card it found', () => {
    const card = new AnimalsFromHome();
    const birds = new Birds();
    game.projectDeck.drawPile.push(birds);
    player.playedCards.push(card);
    card.play(player);
    runAllActions(game);
    expect(card.resourceCount).eq(2);
    expect(player.cardsInHand).includes(birds);
    player.playedCards.push(birds);
    card.onCardPlayed(player, birds);
    expect(birds.resourceCount).eq(2);
    expect(card.resourceCount).eq(0);
  });

  it('Flora, Fauna, and Funga: its cards play 4 steps early and get 2 resources', () => {
    const card = new FloraFaunaAndFunga();
    const tardigrades = new Tardigrades();
    const fish = new Fish(); // +2 °C
    game.projectDeck.drawPile.push(fish, tardigrades);
    player.playedCards.push(card);
    card.play(player);
    runAllActions(game);
    setTemperature(game, -6);
    player.megaCredits = 50;
    other.production.add('plants' as any, 1);
    expect(fish.canPlay(player)).is.true;
    setTemperature(game, -10);
    expect(fish.canPlay(player)).is.false;
    card.onCardPlayed(player, fish);
    expect(fish.resourceCount).eq(2);
  });

  it('Flowstone Cave goes next to a volcanic area', () => {
    const card = new FlowstoneCave();
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    for (const s of select.spaces) {
      expect(game.board.getAdjacentSpaces(s).some((a) => a.volcanic)).is.true;
    }
    select.cb(select.spaces[0]);
    expect(select.spaces[0].tile?.tileType).eq(TileType.FLOWSTONE_CAVE);
  });

  it('Greeting Card: 25 M€ off and no global requirements, this generation only', () => {
    const card = new GreetingCard();
    player.playedCards.push(card);
    const birds = new Birds();
    game.projectDeck.drawPile.push(new Vipers(), new Vipers(), new Vipers(), birds);
    card.play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([birds]);
    expect(player.getCardCost(birds)).eq(0);
    other.production.add('plants' as any, 2);
    player.megaCredits = 0;
    expect(birds.canPlay(player)).is.true;
    game.generation++;
    expect(player.getCardCost(birds)).eq(10);
  });

  it('Jellyfish Farms: tiles next to the marked ocean give an animal', () => {
    const card = new JellyfishFarms();
    player.playedCards.push(card);
    card.play(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    const ocean = select.spaces[0];
    select.cb(ocean);
    const birds = new Birds();
    other.playedCards.push(birds);
    const next = game.board.getAdjacentSpaces(ocean).find((s) => s.tile === undefined && s.spaceType === 'land')!;
    game.addGreenery(other, next);
    runAllActions(game);
    expect(game.deferredActions.length + birds.resourceCount).is.greaterThan(0);
  });

  it('Relativistic Reverberation copies another player\'s prelude as a first action', () => {
    other.playedCards.push(new CrashingSpaceDebris());
    const card = new RelativisticReverberation();
    card.play(player);
    expect(player.pendingInitialActions).has.length(1);
    const tr = player.terraformRating;
    cast(card.initialAction(player), SelectCard).cb([new CrashingSpaceDebris()]);
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 2);
    expect(player.titanium).eq(2);
  });

  it('Sunken City places an ocean city', () => {
    player.cardsInHand.push(new Vipers());
    const card = new SunkenCity();
    card.play(player);
    runAllActions(game);
    let select = cast(cast(player.popWaitingFor(), SelectCard).cb([player.cardsInHand[0]]), SelectSpace);
    select = cast(select.cb(select.spaces[0]), SelectSpace);
    select = cast(select.cb(select.spaces[0]), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.OCEAN_CITY);
    expect(game.board.getOceanSpaces()).has.length(2);
  });

  it('Venusian Microfauna refuses outside microbes and can give one away', () => {
    const card = new VenusianMicrofauna();
    player.playedCards.push(card);
    card.resourceCount = 3;
    const amoeboid = new ViralAmoeboid();
    player.playedCards.push(amoeboid);
    expect(new AddResourcesToCard(player, CardResource.MICROBE).getCards()).deep.eq([amoeboid]);
    cast(card.onCardPlayed(player, amoeboid), OrOptions).options[0].cb(undefined);
    expect(amoeboid.resourceCount).eq(1);
    expect(card.resourceCount).eq(2);
  });
});
