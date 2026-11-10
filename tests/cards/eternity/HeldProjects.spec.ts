import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {fakeCard, runAllActions, setTemperature, setOxygenLevel} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {CardType} from '../../../src/common/cards/CardType';
import {Tag} from '../../../src/common/cards/Tag';
import {CardResource} from '../../../src/common/CardResource';
import {TileType} from '../../../src/common/TileType';
import {Payment} from '../../../src/common/inputs/Payment';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {IProjectCard} from '../../../src/server/cards/IProjectCard';
import {Eternity} from '../../../src/server/cards/eternity/Eternity';
import {NEUTRAL_COLONY_ID} from '../../../src/server/colonies/NeutralColony';
import {AdministrativeRestructure} from '../../../src/server/cards/eternity/AdministrativeRestructure';
import {EternalSpaceWalk} from '../../../src/server/cards/eternity/EternalSpaceWalk';
import {GestaltIntelligence} from '../../../src/server/cards/eternity/GestaltIntelligence';
import {PriceManipulationSubsidies} from '../../../src/server/cards/eternity/PriceManipulationSubsidies';
import {ProjectSelectionDevice} from '../../../src/server/cards/eternity/ProjectSelectionDevice';
import {TardigradeParthenogenesis} from '../../../src/server/cards/eternity/TardigradeParthenogenesis';
import {ThawingGlacier} from '../../../src/server/cards/eternity/ThawingGlacier';
import {BigCheats} from '../../../src/server/cards/eternity/BigCheats';
import {CallTheFixer} from '../../../src/server/cards/eternity/CallTheFixer';
import {ClonedWorkforce} from '../../../src/server/cards/eternity/ClonedWorkforce';
import {CloudSpaceMirrors} from '../../../src/server/cards/eternity/CloudSpaceMirrors';
import {ColonyCluster} from '../../../src/server/cards/eternity/ColonyCluster';
import {FragmentedMeteorStrike} from '../../../src/server/cards/eternity/FragmentedMeteorStrike';
import {IdentityDatabase} from '../../../src/server/cards/eternity/IdentityDatabase';
import {InitiativeManipulator} from '../../../src/server/cards/eternity/InitiativeManipulator';
import {InterplanetaryDomain} from '../../../src/server/cards/eternity/InterplanetaryDomain';
import {PoweredSteel} from '../../../src/server/cards/eternity/PoweredSteel';
import {SabotagedSatelliteRepair} from '../../../src/server/cards/eternity/SabotagedSatelliteRepair';
import {SunsetOverArsiaMons} from '../../../src/server/cards/eternity/SunsetOverArsiaMons';
import {Upheaval} from '../../../src/server/cards/eternity/Upheaval';
import {Wormhole} from '../../../src/server/cards/eternity/Wormhole';
import {DocumentationError} from '../../../src/server/cards/eternity/DocumentationError';
import {EndOfPhaeton} from '../../../src/server/cards/eternity/EndOfPhaeton';
import {Birds} from '../../../src/server/cards/base/Birds';
import {AICentral} from '../../../src/server/cards/base/AICentral';
import {NuclearPower} from '../../../src/server/cards/base/NuclearPower';
import {ReleaseOfInertGases} from '../../../src/server/cards/base/ReleaseOfInertGases';
import {RestrictedArea} from '../../../src/server/cards/base/RestrictedArea';
import {SpaceStation} from '../../../src/server/cards/base/SpaceStation';
import {Mine} from '../../../src/server/cards/base/Mine';
import {Biofuels} from '../../../src/server/cards/prelude/Biofuels';
import {Scientist} from '../../../src/server/awards/Scientist';

describe('Eternity held project cards', () => {
  let game: IGame;
  let player: TestPlayer;
  let other: TestPlayer;

  beforeEach(() => {
    [game, player, other] = testGame(2, {eternityExpansion: true, preludeExtension: true});
  });

  it('Administrative Restructure: 1 action per turn for the rest of the generation', () => {
    player.playCard(new AdministrativeRestructure());
    runAllActions(game);
    expect(player.availableActionsThisRound).eq(1);
    expect(other.availableActionsThisRound).eq(1);
    expect(Eternity.actionsPerTurn(game)).eq(1);
    (game as any).generation++;
    expect(Eternity.actionsPerTurn(game)).eq(2);
  });

  it('Eternal Space Walk: only project card this generation, space cards cost more, buying cheaper', () => {
    const walk = new EternalSpaceWalk();
    player.projectCardsThisGeneration.push(CardName.MINE);
    expect(walk.canPlay(player)).is.false;
    player.projectCardsThisGeneration = [];
    expect(walk.canPlay(player)).is.true;
    player.megaCredits = 0;
    const tr = player.terraformRating;
    player.playCard(walk);
    runAllActions(game);
    expect(player.megaCredits).eq(5);
    expect(player.terraformRating).eq(tr - 1);
    expect(player.cardsInHand).has.length(1);
    expect(player.cardCost).eq(2);
    expect(player.getCardCost(new SpaceStation())).eq(12); // 10 + 2
    expect(new Mine().canPlay(player)).is.false; // no more project cards this generation
  });

  it('Gestalt Intelligence: wild tags count toward awards and tag VP', () => {
    player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
    player.playedCards.push(fakeCard({tags: [Tag.WILD]}));
    const award = new Scientist();
    expect(award.getScore(player)).eq(1);
    const gestalt = new GestaltIntelligence();
    expect(gestalt.canPlay(player)).is.true;
    player.playedCards.push(gestalt);
    expect(award.getScore(player)).eq(3); // science + 2 wild tags (incl. Gestalt)
    (game as any).generation = 7;
    expect(new GestaltIntelligence().canPlay(player)).is.false;
  });

  it('Price Manipulation Subsidies: production pays 2 M€ per other unit', () => {
    player.playCard(new PriceManipulationSubsidies());
    player.production.override({megacredits: 1, steel: 2, heat: 1});
    other.production.override({plants: 3});
    player.megaCredits = 0;
    other.megaCredits = 0;
    player.steel = 0;
    player.finishProductionPhase();
    other.finishProductionPhase();
    expect(player.megaCredits).eq(1 + player.terraformRating + 6);
    expect(player.steel).eq(0);
    expect(other.megaCredits).eq(other.terraformRating + 6);
    expect(other.plants).eq(0);
  });

  it('Project Selection Device: draft 2, gain 3 M€ and pass the device on', () => {
    const [g, a, b] = testGame(2, {eternityExpansion: true, draftVariant: true});
    a.playedCards.push(new ProjectSelectionDevice());
    a.megaCredits = 0;
    g.generation = 2;
    (g as any).gotoDraftPhase();
    const input = cast(a.popWaitingFor(), SelectCard<IProjectCard>);
    expect(input.config.max).eq(2);
    const hand = input.cards;
    input.cb([hand[0], hand[1]]);
    expect(a.megaCredits).eq(3);
    expect(a.playedCards.has(CardName.PROJECT_SELECTION_DEVICE)).is.false;
    expect(a.draftHand.map((c) => c.name)).includes(CardName.PROJECT_SELECTION_DEVICE);
    expect(a.draftedCards).has.length(2);
    expect(a.getWaitingFor()).is.undefined; // no repick after using the device
    const bInput = cast(b.popWaitingFor(), SelectCard<IProjectCard>);
    expect(bInput.config.max).eq(1);
  });

  it('Tardigrade Parthenogenesis: its card ignores global requirements this generation', () => {
    player.playedCards.push(fakeCard({tags: [Tag.MICROBE, Tag.MICROBE]}));
    const card = new TardigradeParthenogenesis();
    expect(card.canPlay(player)).is.true;
    player.playCard(card);
    runAllActions(game);
    const birds = new Birds(); // requires 13% oxygen, removes 2 plant production
    other.production.override({plants: 2});
    card.data = {card: birds.name, gen: game.generation};
    expect(birds.canPlay(player)).is.true;
    (game as any).generation++;
    expect(birds.canPlay(player)).is.false;
  });

  it('Thawing Glacier: becomes an ocean when temperature maxes out', () => {
    const glacier = new ThawingGlacier();
    expect(glacier.canPlay(player)).is.true;
    const select = cast(glacier.play(player), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.GLACIER);
    player.playedCards.push(glacier);
    const oceans = game.board.getOceanSpaces().length;
    const tr = player.terraformRating;
    setTemperature(game, 6);
    game.increaseTemperature(other, 1);
    runAllActions(game);
    expect(space.tile?.tileType).eq(TileType.OCEAN);
    expect(game.board.getOceanSpaces().length).eq(oceans + 1);
    expect(player.terraformRating).eq(tr + 1);
    expect(player.production.plants).eq(2);
  });

  it('Big Cheats: reveals a blue card, then counts ignored tags and steps as cheats', () => {
    const cheats = new BigCheats();
    player.megaCredits = 0;
    player.playCard(cheats);
    runAllActions(game);
    const blue = player.cardsInHand[0];
    expect(blue.type).eq(CardType.ACTIVE);
    expect(player.megaCredits).eq(Math.ceil(blue.cost / 2));
    const central = new AICentral(); // requires 3 science tags, -1 energy production
    player.production.override({energy: 1});
    other.production.override({plants: 2});
    cheats.data = {card: central.name, gen: game.generation};
    player.megaCredits = 100;
    expect(central.canPlay(player)).is.true;
    player.playCard(central);
    expect(cheats.resourceCount).eq(2); // Big Cheats' own wild tag counts as one science tag
    expect(cheats.getVictoryPoints(player)).eq(-1);
    const birds = new Birds(); // oxygen 13
    cheats.data = {card: birds.name, gen: game.generation};
    setOxygenLevel(game, 10);
    expect(birds.canPlay(player)).is.true;
    player.playCard(birds);
    expect(cheats.resourceCount).eq(5);
    // Action: pay 5 to remove one.
    expect(cheats.canAct(player)).is.true;
  });

  it('Call the Fixer: pay X, discard X, +X M€ production, draw X/2', () => {
    const fixer = new CallTheFixer();
    player.cardsInHand.push(fixer, fakeCard(), fakeCard(), fakeCard());
    player.megaCredits = 10;
    expect(fixer.canPlay(player)).is.true;
    player.playCard(fixer);
    runAllActions(game);
    const amount = cast(player.popWaitingFor(), SelectAmount);
    expect(amount.max).eq(3);
    amount.cb(2);
    runAllActions(game);
    const discard = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    discard.cb(discard.cards.slice(0, 2));
    runAllActions(game);
    expect(player.megaCredits).eq(8);
    expect(player.production.megacredits).eq(2);
    expect(player.cardsInHand).has.length(2); // 1 left + 1 drawn
  });

  it('Cloned Workforce: +1 TR and replays a prelude', () => {
    player.playedCards.push(new Biofuels());
    const tr = player.terraformRating;
    player.playCard(new ClonedWorkforce());
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    select.cb([select.cards[0]]);
    runAllActions(game);
    expect(player.terraformRating).eq(tr + 1);
    expect(player.production.energy).eq(1);
    expect(player.production.plants).eq(1);
  });

  it('Cloud Space Mirrors: copies a green card, paying 6 M€ instead of a reduction', () => {
    player.playedCards.push(fakeCard({tags: [Tag.SPACE, Tag.SCIENCE]}));
    other.playedCards.push(new NuclearPower()); // cost 10, -2 M€ prod, +3 energy prod
    player.playedCards.push(new Mine());
    const mirrors = new CloudSpaceMirrors();
    player.megaCredits = 30;
    expect(mirrors.canPlay(player)).is.true;
    player.playCard(mirrors);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    expect(select.cards.map((c) => c.name)).to.have.members([CardName.NUCLEAR_POWER, CardName.MINE]);
    const next = select.cb([select.cards.find((c) => c.name === CardName.NUCLEAR_POWER)!]);
    const first = cast(next, OrOptions);
    const second = cast(first.options[1].cb(), OrOptions);
    second.options[0].cb(); // decrease once, paid 6 for the other
    runAllActions(game); // only M€ to pay with: 10 + 6, paid automatically
    expect(player.production.energy).eq(3);
    expect(player.production.megacredits).eq(-1);
    expect(player.megaCredits).eq(14);
    expect(mirrors.getVictoryPoints(player)).eq(0);
  });

  it('Colony Cluster: a colony and a neutral colony, both bonuses to you', () => {
    const [g, p] = testGame(2, {eternityExpansion: true, coloniesExtension: true});
    const card = new ColonyCluster();
    expect(card.canPlay(p)).is.true;
    const select = cast(card.play(p), SelectColony);
    const colony = select.colonies[0];
    select.cb(colony);
    runAllActions(g);
    expect(colony.colonies).deep.eq([p.id, NEUTRAL_COLONY_ID]);
    expect(p.getColoniesCount()).eq(1);
    // Trading still works: neutral colonies give no bonus.
    colony.trade(p);
    runAllActions(g);
  });

  it('Fragmented Meteor Strike: Ground Zero tile; adjacent owners trade a plant for titanium', () => {
    const card = new FragmentedMeteorStrike();
    const select = cast(card.play(player), SelectSpace);
    const space = select.spaces[0];
    const adj = game.board.getAdjacentSpaces(space).find((s) => s.tile === undefined && game.board.getAvailableSpacesOnLand(other).includes(s));
    expect(adj).is.not.undefined;
    game.addGreenery(other, adj!);
    other.plants = 2;
    other.titanium = 0;
    select.cb(space);
    expect(space.tile?.tileType).eq(TileType.GROUND_ZERO);
    runAllActions(game);
    expect(other.plants).eq(1);
    expect(other.titanium).eq(1);
  });

  it('Identity Database: uses an opponent\'s blue card action', () => {
    const db = new IdentityDatabase();
    other.playedCards.push(new RestrictedArea()); // Action: spend 2 M€ to draw a card
    player.playedCards.push(db);
    player.megaCredits = 4;
    expect(db.canAct(player)).is.false; // 3 + 2 needed
    player.megaCredits = 5;
    expect(db.canAct(player)).is.true;
    const select = cast(db.action(player), SelectCard);
    select.cb([select.cards[0]]);
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(player.cardsInHand).has.length(1);
  });

  it('Initiative Manipulator: pass right, gain 9 M€ and keep the first player marker', () => {
    const card = new InitiativeManipulator();
    player.playCard(card);
    runAllActions(game);
    expect(card.resourceCount).eq(1);
    game.overrideFirstPlayer(player);
    player.megaCredits = 0;
    card.onProductionPhase(player);
    runAllActions(game);
    const options = cast(player.popWaitingFor(), OrOptions);
    options.options[0].cb();
    expect(player.megaCredits).eq(9);
    expect(other.playedCards.has(CardName.INITIATIVE_MANIPULATOR)).is.true;
    expect(player.playedCards.has(CardName.INITIATIVE_MANIPULATOR)).is.false;
    expect(card.getVictoryPoints(other)).eq(2);
    (game as any).generation++;
    (game as any).setNextFirstPlayer();
    expect(game.first).eq(player);
  });

  it('Interplanetary Domain: reveals cheap Mars, Earth and Venus cards to play or discard', () => {
    const [g, p] = testGame(2, {eternityExpansion: true, venusNextExtension: true});
    p.playedCards.push(fakeCard({tags: [Tag.MARS, Tag.EARTH, Tag.VENUS]}));
    const card = new InterplanetaryDomain();
    expect(card.canPlay(p)).is.true;
    card.play(p);
    runAllActions(g);
    let decisions = 0;
    for (let input = p.popWaitingFor(); input !== undefined; input = p.popWaitingFor()) {
      const or = cast(input, OrOptions);
      or.options[or.options.length - 1].cb(); // discard
      runAllActions(g);
      decisions++;
    }
    expect(decisions).lte(3);
  });

  it('Powered Steel: energy pays like M€', () => {
    player.playedCards.push(new PoweredSteel());
    player.megaCredits = 2;
    player.energy = 3;
    expect(player.canUseEnergyAsMegaCredits).is.true;
    expect(player.spendableMegacredits()).eq(5);
    expect(player.canAfford(5)).is.true;
    expect(player.payingAmount(Payment.of({megacredits: 2, energy: 3}))).eq(5);
    player.pay(Payment.of({megacredits: 2, energy: 3}));
    expect(player.energy).eq(0);
    expect(other.canUseEnergyAsMegaCredits).is.false;
  });

  it('Sabotaged Satellite Repair: opponents who played a space tag lose 10 M€', () => {
    other.playedCards.push(new SpaceStation());
    other.projectCardsThisGeneration.push(CardName.SPACE_STATION);
    other.megaCredits = 15;
    player.playCard(new SabotagedSatelliteRepair());
    runAllActions(game);
    expect(other.megaCredits).eq(5);
  });

  it('Sunset over Arsia Mons: discards count as 2 M€ each', () => {
    const sunset = new SunsetOverArsiaMons();
    player.cardsInHand.push(sunset, fakeCard(), fakeCard(), fakeCard());
    expect(player.getCardCost(sunset)).eq(6);
    player.megaCredits = 6;
    player.playCard(sunset, Payment.of({megacredits: 6}));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    expect(select.config.min).eq(3); // no money left, must discard all 3
    select.cb(select.cards);
    runAllActions(game);
    expect(player.cardsInHand).is.empty;
  });

  it('Upheaval: returns a played card to hand and removes its special tile', () => {
    const glacier = new ThawingGlacier();
    const select = cast(glacier.play(player), SelectSpace);
    const space = select.spaces[0];
    select.cb(space);
    player.playedCards.push(glacier);
    player.playCard(new Upheaval());
    runAllActions(game);
    const pick = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    pick.cb([glacier]);
    expect(player.cardsInHand).includes(glacier);
    expect(player.playedCards.has(CardName.THAWING_GLACIER)).is.false;
    expect(space.tile).is.undefined;
  });

  it('Wormhole: replays an event for 4 M€ plus its cost, then removes it', () => {
    const wormhole = new Wormhole();
    const event = new ReleaseOfInertGases(); // 14 M€, +2 TR
    player.playedCards.push(wormhole, event);
    player.megaCredits = 17;
    expect(wormhole.canAct(player)).is.false;
    player.megaCredits = 18;
    expect(wormhole.canAct(player)).is.true;
    const tr = player.terraformRating;
    const select = cast(wormhole.action(player), SelectCard);
    select.cb([event]);
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(player.terraformRating).eq(tr + 2);
    expect(player.playedCards.has(CardName.RELEASE_OF_INERT_GASES)).is.false;
    expect(player.removedFromPlayCards).includes(event);
  });

  it('Documentation "Error": non-payers shuffle 2 cards each', () => {
    player.cardsInHand.push(fakeCard({name: 'a' as CardName}), fakeCard({name: 'b' as CardName}));
    other.cardsInHand.push(fakeCard({name: 'c' as CardName}));
    other.megaCredits = 10;
    player.playCard(new DocumentationError());
    runAllActions(game);
    const choice = cast(other.popWaitingFor(), OrOptions);
    choice.options[1].cb(); // join the shuffle
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(other.cardsInHand).has.length(2); // topped up to 2, then dealt 2 back
  });

  it('End of Phaeton: removes a Jovian card, plays a hand card and a discard card for free', () => {
    const jovian = fakeCard({tags: [Tag.JOVIAN], type: CardType.AUTOMATED});
    player.playedCards.push(jovian);
    const card = new EndOfPhaeton();
    expect(card.canPlay(player)).is.true;
    player.playedCards.remove(jovian);
    expect(card.canPlay(player)).is.false;
    player.playedCards.push(jovian);
    player.cardsInHand.push(new Mine());
    game.projectDeck.discardPile.push(new NuclearPower());
    card.play(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectCard).cb([jovian]);
    runAllActions(game);
    const fromHand = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    fromHand.cb([fromHand.cards[0]]);
    runAllActions(game);
    const fromDiscard = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    fromDiscard.cb([fromDiscard.cards.find((c) => c.name === CardName.NUCLEAR_POWER)!]);
    runAllActions(game);
    expect(player.playedCards.has(CardName.MINE)).is.true;
    expect(player.playedCards.has(CardName.NUCLEAR_POWER)).is.true;
    expect(player.production.energy).eq(3);
    expect(player.removedFromPlayCards).includes(jovian);
    expect(player.cardsInHand.find((c) => c.name === CardName.MINE)).is.undefined;
  });
});
