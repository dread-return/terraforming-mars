import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {fakeCard, runAllActions, setVenusScaleLevel} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {AtmosphericCompressor} from '../../../src/server/cards/solaris/AtmosphericCompressor';
import {OrbitalHydrogeologicCannon} from '../../../src/server/cards/solaris/OrbitalHydrogeologicCannon';
import {ExtraplanetaryUrbanizator} from '../../../src/server/cards/solaris/ExtraplanetaryUrbanizator';
import {PlanetaryCoreInductor} from '../../../src/server/cards/solaris/PlanetaryCoreInductor';
import {SyntheticGargantuaTrees} from '../../../src/server/cards/solaris/SyntheticGargantuaTrees';
import {ArtificialMoon} from '../../../src/server/cards/solaris/ArtificialMoon';
import {Stellatron} from '../../../src/server/cards/solaris/Stellatron';
import {StellarEngine} from '../../../src/server/cards/solaris/StellarEngine';

describe('Solaris galactic action cards', () => {
  it('Atmospheric Compressor: requires 7 space tags, raises oxygen, 3 VP per galactic tag', () => {
    const card = new AtmosphericCompressor();
    const [game, player] = testGame(2);
    for (let i = 0; i < 6; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
    }
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SPACE]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(card.canAct(player)).is.true;
    card.action(player);
    runAllActions(game);
    expect(game.getOxygenLevel()).eq(1);
    expect(card.getVictoryPoints(player)).eq(3);
    player.playedCards.push(fakeCard({tags: [Tag.GALACTIC]}));
    expect(card.getVictoryPoints(player)).eq(6);
  });

  it('Orbital Hydrogeologic Cannon: costs 3 energy production, places an ocean', () => {
    const card = new OrbitalHydrogeologicCannon();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    player.production.add('energy', 3);
    expect(card.canPlay(player)).is.true;
    card.play(player);
    expect(player.production.energy).eq(0);
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    selectSpace.cb(selectSpace.spaces[0]);
    expect(game.board.getOceanSpaces()).has.length(1);
    expect(player.tags.count(Tag.RADIOACTIVE)).eq(1);
  });

  it('Extraplanetary Urbanizator: requires TR 40, places a city and adds M€ production', () => {
    const card = new ExtraplanetaryUrbanizator();
    const [game, player] = testGame(2);
    player.setTerraformRating(39);
    expect(card.canPlay(player)).is.false;
    player.setTerraformRating(40);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    selectSpace.cb(selectSpace.spaces[0]);
    expect(game.board.getCities(player)).has.length(1);
    expect(player.production.megacredits).eq(1);
  });

  it('Planetary Core Inductor: requires 7 science tags, raises temperature', () => {
    const card = new PlanetaryCoreInductor();
    const [game, player] = testGame(2);
    for (let i = 0; i < 6; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    }
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    expect(game.getTemperature()).eq(-28);
  });

  it('Synthetic Gargantua Trees: requires 5 plant tags, places a greenery', () => {
    const card = new SyntheticGargantuaTrees();
    const [game, player] = testGame(2);
    for (let i = 0; i < 4; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.PLANT]}));
    }
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.PLANT]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    const selectSpace = cast(player.popWaitingFor(), SelectSpace);
    selectSpace.cb(selectSpace.spaces[0]);
    expect(game.board.getGreeneries(player)).has.length(1);
    expect(game.getOxygenLevel()).eq(1);
  });

  it('Artificial Moon: requires 6 Earth tags, draws 4 cards', () => {
    const card = new ArtificialMoon();
    const [game, player] = testGame(2);
    for (let i = 0; i < 5; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.EARTH]}));
    }
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.EARTH]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    expect(player.cardsInHand).has.length(4);
  });

  it('Stellatron: requires 5 Venus tags, raises Venus', () => {
    const card = new Stellatron();
    const [game, player] = testGame(2, {venusNextExtension: true});
    for (let i = 0; i < 4; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.VENUS]}));
    }
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.VENUS]}));
    expect(card.canPlay(player)).is.true;
    setVenusScaleLevel(game, 0);
    player.playedCards.push(card);
    card.action(player);
    runAllActions(game);
    expect(game.getVenusScaleLevel()).eq(2);
  });

  it('Stellar Engine: 2 galactic tags, 5 M€ discount on every card', () => {
    const card = new StellarEngine();
    const [/* game */, player] = testGame(2);
    for (let i = 0; i < 10; i++) {
      player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    }
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    expect(card.getVictoryPoints(player)).eq(6);
    expect(player.getCardCost(fakeCard({cost: 12}))).eq(7);
  });
});
