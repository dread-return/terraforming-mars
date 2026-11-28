import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, maxOutOceans, runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Phase} from '../../../src/common/Phase';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {ChooseCards} from '../../../src/server/deferredActions/ChooseCards';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {PlaceOceanTile} from '../../../src/server/deferredActions/PlaceOceanTile';
import {Turmoil} from '../../../src/server/turmoil/Turmoil';
import {IProjectCard} from '../../../src/server/cards/IProjectCard';
import {OmniConsumerProducts} from '../../../src/server/cards/epic/OmniConsumerProducts';
import {InnastarCorp} from '../../../src/server/cards/eternity/InnastarCorp';
import {NOJO} from '../../../src/server/cards/epic/NOJO';
import {EvoAcademies} from '../../../src/server/cards/epic/EvoAcademies';
import {PolitiCorp} from '../../../src/server/cards/epic/PolitiCorp';
import {StreamlineLogistics} from '../../../src/server/cards/epic/StreamlineLogistics';
import {Pallas} from '../../../src/server/cards/epic/Pallas';
import {SpartansSecurity} from '../../../src/server/cards/epic/SpartansSecurity';
import {HephaestusWorks} from '../../../src/server/cards/mercury/HephaestusWorks';
import {PlanetForge} from '../../../src/server/cards/epic/PlanetForge';
import {AquarinEnt} from '../../../src/server/cards/epic/AquarinEnt';
import {PurNKleen} from '../../../src/server/cards/epic/PurNKleen';
import {SolarVoyager} from '../../../src/server/cards/epic/SolarVoyager';
import {UnionAerospace} from '../../../src/server/cards/epic/UnionAerospace';
import {Leviathan} from '../../../src/server/cards/epic/Leviathan';
import {SulphurEatingBacteria} from '../../../src/server/cards/venusNext/SulphurEatingBacteria';
import {SelectProjectCardToPlay} from '../../../src/server/inputs/SelectProjectCardToPlay';
import {Resource} from '../../../src/common/Resource';
import {PanaceaBiologics} from '../../../src/server/cards/epic/PanaceaBiologics';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {PlayerInput} from '../../../src/server/PlayerInput';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {cardsToModel} from '../../../src/server/models/ModelUtils';
import {GameCards} from '../../../src/server/GameCards';
import {newCard} from '../../../src/server/createCard';
import {DEFAULT_GAME_OPTIONS} from '../../../src/server/game/GameOptions';
import {TEO} from '../../../src/server/cards/epic/TEO';
import {GenetiCorp} from '../../../src/server/cards/eternity/GenetiCorp';
import {BamBooBuildings} from '../../../src/server/cards/eternity/BamBooBuildings';
import {AstroSoils} from '../../../src/server/cards/eternity/AstroSoils';
import {Comet} from '../../../src/server/cards/base/Comet';
import {KelpFarming} from '../../../src/server/cards/base/KelpFarming';
import {Payment} from '../../../src/common/inputs/Payment';
import {OrOptions} from '../../../src/server/inputs/OrOptions';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Corporations reworked after the overlap review (2026-11-27)', () => {
  it('Omni Consumer Products: Earth tag, usual card price (its action changed again in the Tier 2 round, tested there)', () => {
    const corp = new OmniConsumerProducts();
    const [, player] = withCorp(corp);
    expect(corp.tags).deep.eq([Tag.EARTH]);
    expect(player.cardCost).eq(3);
    expect(player.production.megacredits).eq(2);
  });

  it('Innastar Corp: building tag', () => {
    expect(new InnastarCorp().tags).deep.eq([Tag.BUILDING]);
  });

  it('NOJO: buys Jovian cards for free', () => {
    const [game, player] = withCorp(new NOJO());
    const jovian = fakeCard({name: 'j' as CardName, tags: [Tag.JOVIAN]});
    const plain = fakeCard({name: 'p' as CardName, tags: [Tag.BUILDING]});
    player.megaCredits = 3;
    const input = cast(new ChooseCards(player, [jovian, plain], {paying: true}).execute(), SelectCard<IProjectCard>);
    // One paid card plus the free Jovian one.
    expect(input.config.max).eq(2);
    input.cb([jovian, plain]);
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(player.cardsInHand).has.members([jovian, plain]);

    player.megaCredits = 0;
    const second = fakeCard({name: 'j2' as CardName, tags: [Tag.JOVIAN]});
    const free = cast(new ChooseCards(player, [second], {paying: true}).execute(), SelectCard<IProjectCard>);
    free.cb([second]);
    runAllActions(game);
    expect(player.cardsInHand).contains(second);
  });

  it('Evo Academies: animal tag, no microbe discount, first action takes a microbe card and an animal card', () => {
    const corp = new EvoAcademies();
    const [game, player] = withCorp(corp);
    expect(corp.tags).contains(Tag.ANIMAL);
    expect(player.getCardCost(fakeCard({tags: [Tag.MICROBE], cost: 10}))).eq(10);
    corp.initialAction(player);
    runAllActions(game);
    expect(player.cardsInHand).has.length(2);
    expect(player.cardsInHand[0].tags).contains(Tag.MICROBE);
    expect(player.cardsInHand[1].tags).contains(Tag.ANIMAL);
  });

  it('PolitiCorp: +1 influence, no first action, cards cost 1 less while chairman', () => {
    const corp = new PolitiCorp();
    expect(corp.firstAction).is.undefined;
    const [game, player] = withCorp(corp, {turmoilExtension: true});
    const turmoil = Turmoil.getTurmoil(game);
    expect(turmoil.playersInfluenceBonus.get(player.id)).eq(1);
    const card = fakeCard({cost: 10});
    turmoil.chairman = 'NEUTRAL';
    expect(player.getCardCost(card)).eq(10);
    turmoil.chairman = player;
    expect(player.getCardCost(card)).eq(9);
  });

  it('Streamline Logistics: the action works up to 3 times a generation', () => {
    const corp = new StreamlineLogistics();
    const [game, player] = withCorp(corp);
    corp.resourceCount = 5;
    for (let i = 1; i <= 3; i++) {
      corp.action(player);
      player.actionsThisGeneration.add(corp.name);
      runAllActions(game);
      expect(player.actionsThisGeneration.has(corp.name)).eq(i === 3);
    }
    expect(corp.resourceCount).eq(2);
    game.generation++;
    player.actionsThisGeneration.clear();
    corp.action(player);
    player.actionsThisGeneration.add(corp.name);
    runAllActions(game);
    expect(player.actionsThisGeneration.has(corp.name)).is.false;
  });

  it('Pallas: 1 titanium production, no titanium, space events cost 2 less', () => {
    const [, player] = withCorp(new Pallas());
    expect(player.production.titanium).eq(1);
    expect(player.titanium).eq(0);
    expect(player.getCardCost(fakeCard({type: CardType.EVENT, tags: [Tag.SPACE], cost: 10}))).eq(8);
    expect(player.getCardCost(fakeCard({type: CardType.AUTOMATED, tags: [Tag.SPACE], cost: 10}))).eq(10);
    expect(player.getCardCost(fakeCard({type: CardType.EVENT, tags: [Tag.EARTH], cost: 10}))).eq(10);
  });

  it('Spartans Security: Mars tag', () => {
    expect(new SpartansSecurity().tags).deep.eq([Tag.MARS]);
  });


  it('Hephaestus Works and Planet Forge: first action takes a Mercury or a Venus card', () => {
    const heph = new HephaestusWorks();
    const [game, player] = withCorp(heph, {mercuryExpansion: true});
    expect(player.production.steel).eq(2);
    player.defer(heph.initialAction(player));
    runAllActions(game);
    expect(player.cardsInHand.at(-1)?.tags).contains(Tag.MERCURY);

    const forge = new PlanetForge();
    const [game2, p2] = withCorp(forge, {venusNextExtension: true});
    p2.defer(forge.initialAction(p2));
    runAllActions(game2);
    expect(p2.cardsInHand.at(-1)?.tags).contains(Tag.VENUS);
  });

  it('Aquarin Ent.: +1 M€ production per ocean; keeps placing oceans after the maximum, without TR', () => {
    const [game, player, other] = withCorp(new AquarinEnt());
    maxOutOceans(other);
    expect(player.production.megacredits).eq(game.board.getOceanSpaces().length);
    expect(game.canAddOcean()).is.false;
    const tr = player.terraformRating;
    const prod = player.production.megacredits;
    game.defer(new PlaceOceanTile(player));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    expect(select.spaces[0].tile?.tileType).is.not.undefined;
    expect(player.terraformRating).eq(tr);
    expect(player.production.megacredits).eq(prod + 1);

    // Anyone else still can't.
    game.defer(new PlaceOceanTile(other));
    runAllActions(game);
    expect(other.popWaitingFor()).is.undefined;
  });

  // Round 2 (groups 21-25), 2026-11-28.
  it('TEO: draws 5 research cards, like Luna Project Office; no science discount', () => {
    const [, player] = withCorp(new TEO());
    expect(player.getCardCost(fakeCard({tags: [Tag.SCIENCE], cost: 10}))).eq(10);
    player.runResearchPhase();
    expect(JSON.stringify(player.popWaitingFor()?.toModel(player))).to.include('"max":5');
  });

  it('GenetiCorp: animal cards cost 2 less, science cards don\'t', () => {
    const [, player] = withCorp(new GenetiCorp());
    expect(player.getCardCost(fakeCard({tags: [Tag.ANIMAL], cost: 10}))).eq(8);
    expect(player.getCardCost(fakeCard({tags: [Tag.SCIENCE], cost: 10}))).eq(10);
  });

  it('BamBooBuildings: 1 plant production; plants pay 3 M€ for plant cards only; no steel or plant bonus', () => {
    const [, player] = withCorp(new BamBooBuildings());
    expect(player.production.plants).eq(1);
    expect(player.production.steel).eq(1);
    const kelp = new KelpFarming();
    const options = player.paymentOptionsForCard(kelp);
    expect(options.plants).is.true;
    expect(options.steel).is.false;
    expect(player.payingAmount(Payment.of({plants: 2}), options)).eq(6);
    const building = fakeCard({tags: [Tag.BUILDING], cost: 10});
    expect(player.paymentOptionsForCard(building).plants).is.false;
    player.plants = 0;
    player.playCard(building);
    expect(player.plants).eq(0);
  });

  it('AstroSoils: plants removed by your space events come to you', () => {
    const [game, player, other] = withCorp(new AstroSoils());
    other.plants = 5;
    player.plants = 0;
    player.playCard(new Comet());
    runAllActions(game);
    // Comet: raise temperature, place an ocean, remove up to 3 plants from any player.
    for (let input = player.popWaitingFor(); input !== undefined; input = player.popWaitingFor()) {
      if (input instanceof SelectSpace) {
        input.cb(input.spaces[0]);
      } else if (input instanceof OrOptions) {
        const steal = input.options.findIndex((o) => JSON.stringify(o.toModel(player)).includes(other.color));
        input.options[steal >= 0 ? steal : 0].cb();
      }
      runAllActions(game);
    }
    expect(other.plants).eq(2);
    expect(player.plants).eq(3);
    // Not for a non-space removal afterwards.
    expect(game.deferredActions.length).eq(0);
  });

  describe('Panacea Biologics (replaces Quash)', () => {
    function cureOption(player: TestPlayer): SelectOption | undefined {
      const free: PlayerInput | undefined = EpicHooks.freeActionOption(player);
      const options = free === undefined ? [] : free instanceof OrOptions ? free.options : [free];
      return options.find((o) => JSON.stringify(o.title).includes('cure')) as SelectOption | undefined;
    }

    it('Patient Zero puts a disease on each opponent; each disease costs them 1 M€ per card, shown on their corporation', () => {
      const corp = new PanaceaBiologics();
      const [game, player, other, third] = testGame(3, {epicCorporations: true});
      player.playCorporationCard(corp);
      runAllActions(game);
      corp.initialAction(player);
      expect(EpicHooks.diseasesOn(other)).eq(1);
      expect(EpicHooks.diseasesOn(third)).eq(1);
      expect(EpicHooks.diseasesOn(player)).eq(0);
      const card = fakeCard({cost: 10});
      expect(other.getCardCost(card)).eq(11);
      expect(player.getCardCost(card)).eq(10);
      // The badge count travels on the infected player's corporation.
      const otherCorp = other.playedCards.corporations()[0];
      if (otherCorp !== undefined) {
        expect(cardsToModel(other, [otherCorp])[0].diseases).eq(1);
      }
      expect(cardsToModel(player, [corp])[0].diseases).is.undefined;
    });

    it('Outbreak: any microbe tag lets the owner pick who gets sick (max 3 each), or skip', () => {
      const corp = new PanaceaBiologics();
      const [game, player, other] = withCorp(corp);
      other.playCard(fakeCard({tags: [Tag.MICROBE, Tag.MICROBE]}));
      runAllActions(game);
      // One question per microbe tag; with one opponent the choice is that opponent or skip.
      cast(player.popWaitingFor(), OrOptions).options[0].cb();
      runAllActions(game);
      cast(player.popWaitingFor(), OrOptions).options[1].cb();
      runAllActions(game);
      expect(EpicHooks.diseasesOn(other)).eq(1);
      // Its own microbe tags count too.
      for (let i = 0; i < 4; i++) {
        player.playCard(fakeCard({tags: [Tag.MICROBE]}));
        runAllActions(game);
        const input = player.popWaitingFor();
        if (input instanceof OrOptions) {
          input.options[0].cb();
        }
        runAllActions(game);
      }
      expect(EpicHooks.diseasesOn(other)).eq(PanaceaBiologics.MAX_DISEASES);
    });

    it('Cure: a free action for the infected player; the price rises with the owner\'s science tags; adds a patent', () => {
      const corp = new PanaceaBiologics();
      const [game, player, other] = withCorp(corp);
      corp.initialAction(player);
      expect(PanaceaBiologics.curePrice(player)).eq(3); // its own science tag: 1
      player.playedCards.push(fakeCard({tags: [Tag.SCIENCE, Tag.SCIENCE, Tag.SCIENCE]}));
      expect(PanaceaBiologics.curePrice(player)).eq(5); // 4 science tags
      expect(cureOption(player)).is.undefined;
      other.megaCredits = 4;
      expect(cureOption(other)).is.undefined; // can't afford 5
      other.megaCredits = 10;
      player.megaCredits = 0;
      cureOption(other)!.cb(undefined);
      runAllActions(game);
      expect(other.megaCredits).eq(5);
      expect(player.megaCredits).eq(5);
      expect(corp.resourceCount).eq(1);
      expect(EpicHooks.diseasesOn(other)).eq(0);
      expect(cureOption(other)).is.undefined;
      corp.resourceCount = 4;
      expect(corp.getVictoryPoints(player)).eq(2);
      for (let i = 0; i < 20; i++) {
        player.playedCards.push(fakeCard({tags: [Tag.SCIENCE]}));
      }
      expect(PanaceaBiologics.curePrice(player)).eq(PanaceaBiologics.MAX_CURE_PRICE);
    });

    it('Field trial: 1 microbe from one of your cards spreads a disease', () => {
      const corp = new PanaceaBiologics();
      const [game, player, other] = withCorp(corp);
      expect(corp.canAct(player)).is.false;
      const tardigrades = new Tardigrades();
      player.playedCards.push(tardigrades);
      tardigrades.resourceCount = 2;
      expect(corp.canAct(player)).is.true;
      corp.action(player);
      runAllActions(game);
      const input = player.popWaitingFor();
      if (input instanceof SelectOption) {
        input.cb(undefined);
      }
      expect(tardigrades.resourceCount).eq(1);
      expect(EpicHooks.diseasesOn(other)).eq(1);
    });

    it('is never dealt in solo games', () => {
      const [solo] = testGame(1, {epicCorporations: true});
      expect(solo.corporationDeck.drawPile.map((c) => c.name)).not.contains(CardName.PANACEA_BIOLOGICS);
      const [duo] = testGame(2, {epicCorporations: true});
      expect(duo.corporationDeck.drawPile.map((c) => c.name)).contains(CardName.PANACEA_BIOLOGICS);
    });
  });

  it('Retired corporations still load from saved games, but are never dealt or picked from a custom list', () => {
    const retired = [CardName.QUASH, CardName.COLLINS_RUBIN_AND_HAYTHAM, CardName.BUY_N_LARGE, CardName.EXTRASOLAR_COLONIZATION_ADMINISTRATION,
      CardName.OLYMPIC_GALACTIC_CORPORATION, CardName.MISERVISION, CardName.NEW_THORGATE, CardName.CASH_CO];
    for (const name of retired) {
      expect(newCard(name).name).eq(name);
    }
    const options = {...DEFAULT_GAME_OPTIONS, epicCorporations: true, eternityExpansion: true};
    const dealt = new GameCards(options).getCorporationCards().map((c) => c.name);
    expect(dealt).not.to.include.any.members(retired);
    const custom = new GameCards({...options, customCorporationsList: [CardName.QUASH, CardName.TOYITSU]}).getCorporationCards().map((c) => c.name);
    expect(custom).deep.eq([CardName.TOYITSU]);
  });

  // Tier 2 round (2026-11-28).
  describe('Tier 2 changes', () => {
    it('Pur\'n\'Kleen: your oceans raise your TR 1 extra step; no VP for oceans by cities', () => {
      const corp = new PurNKleen();
      const [game, player, other] = withCorp(corp);
      expect(corp.victoryPoints).is.undefined;
      const tr = player.terraformRating;
      const [first, second] = game.board.getAvailableSpacesForOcean(player);
      game.addOcean(player, first);
      expect(player.terraformRating).eq(tr + 2);
      game.addOcean(other, second);
      expect(player.terraformRating).eq(tr + 2);
    });

    it('Solar Voyager: action plays a Venus, Mercury or Jovian card ignoring its requirements', () => {
      const corp = new SolarVoyager();
      const [game, player] = withCorp(corp, {venusNextExtension: true});
      const bacteria = new SulphurEatingBacteria();
      player.cardsInHand.push(bacteria);
      player.megaCredits = 20;
      expect(player.canPlay(bacteria)).is.false;
      expect(corp.canAct(player)).is.true;
      const input = cast(corp.action(player), SelectProjectCardToPlay);
      expect(input.cards).deep.eq([bacteria]);
      input.payAndPlay(bacteria, Payment.of({megacredits: bacteria.cost}));
      input.cb(bacteria);
      runAllActions(game);
      expect(player.playedCards.has(CardName.SULPHUR_EATING_BACTERIA)).is.true;
      expect(corp.data.pending).is.false;
      expect(player.canPlay(fakeCard({tags: [Tag.VENUS], requirements: [{venus: 30}]}))).is.false;
    });

    it('Union Aerospace: 38 M€; spending energy gives 1 titanium; 4 energy for 1 TR', () => {
      const corp = new UnionAerospace();
      const [game, player, other] = withCorp(corp);
      expect(player.megaCredits).eq(38);
      player.energy = 10;
      player.titanium = 0;
      player.stock.deduct(Resource.ENERGY, 2);
      expect(player.titanium).eq(1);
      // Not when someone else takes it.
      player.stock.deduct(Resource.ENERGY, 1, {from: {player: other}});
      expect(player.titanium).eq(1);
      const tr = player.terraformRating;
      expect(corp.canAct(player)).is.true;
      corp.action(player);
      runAllActions(game);
      expect(player.energy).eq(3);
      expect(player.terraformRating).eq(tr + 1);
      expect(player.titanium).eq(2);
      player.energy = 3;
      expect(corp.canAct(player)).is.false;
    });

    it('Omni Consumer Products: 8 M€ for 2 cards', () => {
      const corp = new OmniConsumerProducts();
      const [game, player] = withCorp(corp);
      player.megaCredits = 7;
      expect(corp.canAct(player)).is.false;
      player.megaCredits = 8;
      corp.action(player);
      runAllActions(game);
      expect(player.megaCredits).eq(0);
      expect(player.cardsInHand).has.length(2);
    });

    it('Leviathan: 40 M€ and 1 titanium production; space cards are free to buy during research only', () => {
      const corp = new Leviathan();
      const [game, player] = withCorp(corp);
      expect(player.megaCredits).eq(40);
      expect(player.production.titanium).eq(1);
      const space = fakeCard({name: 's' as CardName, tags: [Tag.SPACE]});
      const plain = fakeCard({name: 'p' as CardName, tags: [Tag.BUILDING]});
      game.phase = Phase.RESEARCH;
      expect(EpicHooks.cardBuyCost(player, space)).eq(0);
      expect(EpicHooks.cardBuyCost(player, plain)).eq(3);
      expect(EpicHooks.extraResearchCards(player)).eq(0);
      game.phase = Phase.ACTION;
      expect(EpicHooks.cardBuyCost(player, space)).eq(3);
    });
  });
});
