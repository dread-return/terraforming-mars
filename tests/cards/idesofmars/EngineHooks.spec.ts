import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {addGreenery, fakeCard, maxOutOceans, runAllActions} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {Tag} from '../../../src/common/cards/Tag';
import {Phase} from '../../../src/common/Phase';
import {PartyName} from '../../../src/common/turmoil/PartyName';
import {CardName} from '../../../src/common/cards/CardName';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {ConvertPlants} from '../../../src/server/cards/base/standardActions/ConvertPlants';
import {PlaceOceanTile} from '../../../src/server/deferredActions/PlaceOceanTile';
import {PowerPlantStandardProject} from '../../../src/server/cards/base/standardProjects/PowerPlantStandardProject';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {AquiferStandardProject} from '../../../src/server/cards/base/standardProjects/AquiferStandardProject';
import {GreeneryStandardProject} from '../../../src/server/cards/base/standardProjects/GreeneryStandardProject';
import {InsectPollinators} from '../../../src/server/cards/idesofmars/InsectPollinators';
import {AdministrativeDelay} from '../../../src/server/cards/idesofmars/AdministrativeDelay';
import {Backstabbing} from '../../../src/server/cards/idesofmars/Backstabbing';
import {HiddenCity} from '../../../src/server/cards/idesofmars/HiddenCity';
import {BlueMars} from '../../../src/server/cards/idesofmars/BlueMars';
import {GalileoInstitute} from '../../../src/server/cards/idesofmars/GalileoInstitute';
import {PublicRelations} from '../../../src/server/cards/idesofmars/PublicRelations';
import {Slum} from '../../../src/server/cards/idesofmars/Slum';
import {AppliedResearch} from '../../../src/server/cards/idesofmars/AppliedResearch';
import {MartianInfrastructures} from '../../../src/server/cards/idesofmars/MartianInfrastructures';
import {WaterRetainers} from '../../../src/server/cards/idesofmars/WaterRetainers';
import {Copyleft} from '../../../src/server/cards/idesofmars/Copyleft';
import {CollaborationCrossCompanies} from '../../../src/server/cards/idesofmars/CollaborationCrossCompanies';
import {SelectPlayer} from '../../../src/server/inputs/SelectPlayer';
import {Payment} from '../../../src/common/inputs/Payment';
import {AquiferPumping} from '../../../src/server/cards/base/AquiferPumping';
import {DeepFoundations} from '../../../src/server/cards/underworld/DeepFoundations';
import {IdesOfMars} from '../../../src/server/cards/idesofmars/IdesOfMars';

describe('Ides of Mars cards with engine hooks', () => {
  it('Insect Pollinators: greenery next to your greenery costs 1 plant less', () => {
    const [game, player] = testGame(2);
    const convert = new ConvertPlants();
    const greenery = addGreenery(player);
    player.plants = 7;
    expect(convert.canAct(player)).is.false;
    player.playedCards.push(new InsectPollinators());
    expect(convert.canAct(player)).is.true;
    const select = cast(convert.action(player), SelectSpace);
    const adjacent = game.board.getAdjacentSpaces(greenery);
    expect(select.spaces.every((s) => adjacent.includes(s))).is.true;
    select.cb(select.spaces[0]);
    expect(player.plants).eq(0);
  });

  it('Administrative Delay: skip a turn without passing this generation', () => {
    const card = new AdministrativeDelay();
    const [game, player] = testGame(2);
    const hasSkip = () => player.getActions().options.some((o) => o instanceof SelectOption && o.title.toString().startsWith('Skip this turn'));
    expect(hasSkip()).is.false;
    card.play(player);
    player.playedCards.push(card);
    expect(hasSkip()).is.true;
    game.generation++;
    expect(hasSkip()).is.false;
  });

  it('Backstabbing: a delegate in the winning party becomes chairman', () => {
    const card = new Backstabbing();
    const [game, player, opponent] = testGame(2, {turmoilExtension: true});
    const turmoil = Turmoil.getTurmoil(game);
    turmoil.sendDelegateToParty(opponent, PartyName.GREENS, game);
    turmoil.sendDelegateToParty(opponent, PartyName.GREENS, game);
    turmoil.sendDelegateToParty(player, PartyName.GREENS, game);
    card.play(player);
    player.playedCards.push(card);
    turmoil.setRulingParty(game);
    runAllActions(game);
    expect(turmoil.chairman).eq(player);
  });

  it('Hidden City: places a city after final greenery placement', () => {
    const card = new HiddenCity();
    const [game, player] = testGame(2);
    player.playedCards.push(card);
    game.takeNextFinalGreeneryAction();
    const select = cast(player.getWaitingFor(), SelectSpace);
    player.process({type: 'space', spaceId: select.spaces[0].id});
    expect(game.board.getCities(player)).has.length(1);
    expect(game.phase).eq(Phase.END);
  });

  it('Blue Mars: raise TR instead of placing an ocean', () => {
    const card = new BlueMars();
    const [game, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    maxOutOceans(player);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    const tr = player.terraformRating;
    game.defer(new PlaceOceanTile(player));
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 1);
  });

  it('Galileo Institute: Jovian tags count as science tags', () => {
    const [, player] = testGame(2);
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN]}));
    expect(player.tags.count(Tag.SCIENCE)).eq(0);
    player.playedCards.push(new GalileoInstitute());
    expect(player.tags.count(Tag.SCIENCE)).eq(2);
    expect(player.tags.count(Tag.JOVIAN)).eq(2);
  });

  it('Public Relations: negative VP cards do not count', () => {
    const [, player] = testGame(2);
    player.playedCards.push(new Slum());
    const before = player.getVictoryPoints().victoryPoints;
    player.playedCards.push(new PublicRelations());
    expect(player.getVictoryPoints().victoryPoints).eq(before + 1);
  });

  it('Applied Research: draw a card after a standard project', () => {
    const [game, player] = testGame(2);
    player.playedCards.push(new AppliedResearch());
    player.megaCredits = 11;
    new PowerPlantStandardProject().payAndExecute(player, Payment.of({megacredits: 11}));
    runAllActions(game);
    expect(player.cardsInHand).has.length(1);
  });

  it('Martian Infrastructures and Water Retainers discounts', () => {
    const [, player] = testGame(2);
    const infra = new MartianInfrastructures();
    const retainers = new WaterRetainers();
    expect(infra.getStandardProjectDiscount(player, new CityStandardProject())).eq(2);
    expect(infra.getStandardProjectDiscount(player, new PowerPlantStandardProject())).eq(0);
    expect(retainers.getStandardProjectDiscount(player, new AquiferStandardProject())).eq(3);
    expect(retainers.getStandardProjectDiscount(player, new GreeneryStandardProject())).eq(2);
    expect(retainers.getCardDiscount(player, fakeCard({behavior: {ocean: {}}}))).eq(3);
    expect(retainers.getCardDiscount(player, fakeCard({behavior: {greenery: {}}}))).eq(2);
    expect(retainers.getCardDiscount(player, fakeCard({}))).eq(0);
  });

  it('Martian Infrastructures: card actions that place a tile on Mars cost 2 M€ less', () => {
    const [game, player] = testGame(2, {underworldExpansion: true});
    const aquifer = new AquiferPumping();
    const foundations = new DeepFoundations();
    player.megaCredits = 6;
    expect(aquifer.canAct(player)).is.false;
    player.playedCards.push(new MartianInfrastructures());
    expect(aquifer.canAct(player)).is.true;
    aquifer.action(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    expect(player.megaCredits).eq(0);
    expect(game.board.getOceanSpaces()).has.length(1);

    player.megaCredits = 18;
    expect(foundations.canAct(player)).is.true;

    // Actions that don't place a tile keep their price.
    expect(IdesOfMars.actionMegacredits(player, {production: {titanium: 1}}, 11)).eq(11);
    expect(IdesOfMars.actionMegacredits(player, {city: {}}, 11)).eq(9);
  });

  it('Copyleft: the player of a science tag may buy the revealed card, otherwise the owner may', () => {
    const card = new Copyleft();
    const [game, player, opponent] = testGame(2);
    player.playedCards.push(card);
    player.megaCredits = 10;
    opponent.megaCredits = 10;
    card.onCardPlayedByAnyPlayer(player, fakeCard({tags: [Tag.SCIENCE]}), opponent);
    runAllActions(game);
    cast(opponent.popWaitingFor(), OrOptions).options[1].cb();
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);
    expect(player.cardsInHand).has.length(1);
    expect(player.megaCredits).eq(7);
    expect(opponent.cardsInHand).has.length(0);
  });

  it('Collaboration Cross-Companies: gift, then gain TR when the opponent does', () => {
    const card = new CollaborationCrossCompanies();
    const [, player, opponent, third] = testGame(3);
    expect(card.canPlay(player)).is.false;
    player.setTerraformRating(25);
    expect(card.canPlay(player)).is.true;
    player.playedCards.push(card);
    player.megaCredits = 6;
    const select = cast(card.action(player), SelectPlayer);
    const gifts = cast(select.cb(opponent), OrOptions);
    gifts.options[0].cb();
    expect(opponent.megaCredits).eq(6);
    const tr = player.terraformRating;
    third.increaseTerraformRating();
    expect(player.terraformRating).eq(tr);
    opponent.increaseTerraformRating();
    opponent.increaseTerraformRating();
    expect(player.terraformRating).eq(tr + 1);
  });

  it('Card names are registered', () => {
    expect(CardName.UNIVERSAL_FIGHTERS).eq('Universal Fighters');
  });
});
