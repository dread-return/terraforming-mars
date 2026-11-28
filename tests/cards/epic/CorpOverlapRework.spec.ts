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
  it('Omni Consumer Products: Earth tag, usual card price, action to buy or discard the top card', () => {
    const corp = new OmniConsumerProducts();
    const [game, player] = withCorp(corp);
    expect(corp.tags).deep.eq([Tag.EARTH]);
    expect(player.cardCost).eq(3);
    expect(player.production.megacredits).eq(2);
    player.megaCredits = 3;
    corp.action(player);
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard<IProjectCard>);
    expect(select.cards).has.length(1);
    select.cb([select.cards[0]]);
    runAllActions(game);
    expect(player.cardsInHand).has.length(1);
    expect(player.megaCredits).eq(0);
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

  it('BamBooBuildings: 2 plant production; plants pay 3 M€ for plant cards only; no steel or plant bonus', () => {
    const [, player] = withCorp(new BamBooBuildings());
    expect(player.production.plants).eq(2);
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
});
