import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {fakeCard, runAllActions, setTemperature} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {Tag} from '../../../src/common/cards/Tag';
import {CardType} from '../../../src/common/cards/CardType';
import {Resource} from '../../../src/common/Resource';
import {Phase} from '../../../src/common/Phase';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';
import {SelectPayment} from '../../../src/server/inputs/SelectPayment';
import {Payment} from '../../../src/common/inputs/Payment';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {ACE} from '../../../src/server/cards/epic/ACE';
import {AstroAlliance} from '../../../src/server/cards/epic/AstroAlliance';
import {ECMECorporation} from '../../../src/server/cards/epic/ECMECorporation';
import {MeissnerVolt} from '../../../src/server/cards/epic/MeissnerVolt';
import {Marsanto} from '../../../src/server/cards/epic/Marsanto';
import {MINE} from '../../../src/server/cards/epic/MINE';
import {MediumGrounds} from '../../../src/server/cards/epic/MediumGrounds';
import {PaxUtopia} from '../../../src/server/cards/epic/PaxUtopia';
import {PolyPlantae} from '../../../src/server/cards/epic/PolyPlantae';
import {Quash} from '../../../src/server/cards/epic/Quash';
import {StorytellerInc} from '../../../src/server/cards/epic/StorytellerInc';
import {NitrogenRUs} from '../../../src/server/cards/epic/NitrogenRUs';
import {Cryo} from '../../../src/server/cards/epic/Cryo';
import {Lorean} from '../../../src/server/cards/epic/Lorean';
import {LandmarkAchievements} from '../../../src/server/cards/epic/LandmarkAchievements';
import {JanuaryComputationalNetwork} from '../../../src/server/cards/epic/JanuaryComputationalNetwork';
import {OmegaCorporation} from '../../../src/server/cards/epic/OmegaCorporation';
import {Redux} from '../../../src/server/cards/epic/Redux';
import {RODAssociation} from '../../../src/server/cards/epic/RODAssociation';
import {TalosFoundation} from '../../../src/server/cards/epic/TalosFoundation';
import {ChanceSynergetics} from '../../../src/server/cards/epic/ChanceSynergetics';
import {SellPatentsStandardProject} from '../../../src/server/cards/base/standardProjects/SellPatentsStandardProject';
import {Tardigrades} from '../../../src/server/cards/base/Tardigrades';
import {Birds} from '../../../src/server/cards/base/Birds';
import {ArcticAlgae} from '../../../src/server/cards/base/ArcticAlgae';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 3', () => {
  it('ACE: action pays 1 M€ per tag of the named type', () => {
    const ace = new ACE();
    const [, player] = withCorp(ace);
    player.playedCards.push(fakeCard({name: 'b1' as CardName, tags: [Tag.BUILDING]}), fakeCard({name: 'b2' as CardName, tags: [Tag.BUILDING]}));
    const mc = player.megaCredits;
    const options = cast(ace.action(player), OrOptions);
    options.options[0].cb();
    // Building (2) + the corp's own wild tag.
    expect(player.megaCredits).eq(mc + 3);
  });

  it('Astro Alliance: Venus/Earth/Jovian tags add galaxies, 2 can become TR', () => {
    const astro = new AstroAlliance();
    const [game, player] = withCorp(astro);
    // The corp's own three tags: two galaxies, then a choice (add a third).
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(astro.resourceCount).eq(3);
    player.onCardPlayed(fakeCard({name: 'e' as CardName, tags: [Tag.EARTH]}));
    runAllActions(game);
    const tr = player.terraformRating;
    cast(player.popWaitingFor(), OrOptions).options[1].cb();
    expect(astro.resourceCount).eq(1);
    expect(player.terraformRating).eq(tr + 1);
  });

  it('ECME: loses base resources before production, +1 temperature per 8 heat', () => {
    const [game, player] = withCorp(new ECMECorporation());
    player.heat = 17;
    player.steel = 3;
    player.production.override({megacredits: 4, steel: 1});
    const temperature = game.getTemperature();
    player.finishProductionPhase();
    expect(player.steel).eq(1);
    expect(player.heat).eq(0);
    expect(game.getTemperature()).eq(temperature + 4);
  });

  it('MeissnerVolt keeps energy at production and sells it for 2 M€ each', () => {
    const volt = new MeissnerVolt();
    const [, player] = withCorp(volt);
    player.energy = 5;
    expect(EpicHooks.keepsEnergy(player)).is.true;
    const mc = player.megaCredits;
    volt.action(player)!.cb(3);
    expect(player.megaCredits).eq(mc + 6);
    expect(player.energy).eq(2);
  });

  it('Marsanto: plants gained also give M€', () => {
    const [, player] = withCorp(new Marsanto());
    const mc = player.megaCredits;
    player.stock.add(Resource.PLANTS, 3);
    expect(player.megaCredits).eq(mc + 3);
  });

  it('M.I.N.E.: a steel production raise may help both players', () => {
    const [game, player, other] = withCorp(new MINE());
    other.production.add(Resource.STEEL, 1);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    expect(other.production.megacredits).eq(1);
    expect(player.production.titanium).eq(1);
  });

  it('Medium Grounds: opponents\' events pay per tag; own blue cards cost more', () => {
    const [, player, other] = withCorp(new MediumGrounds());
    expect(player.production.megacredits).eq(-1);
    const mc = player.megaCredits;
    other.playCard(fakeCard({name: 'ev' as CardName, type: CardType.EVENT, tags: [Tag.SPACE]}));
    expect(player.megaCredits).eq(mc + 2);
    expect(player.getCardCost(fakeCard({name: 'blue' as CardName, type: CardType.ACTIVE, tags: [Tag.SCIENCE, Tag.POWER], cost: 10}))).eq(12);
  });

  it('Pax Utopia: TR for cards; VP from positive and opponents\' negative cards', () => {
    const pax = new PaxUtopia();
    const [, player, other] = withCorp(pax);
    expect(player.terraformRating).eq(25);
    pax.action(player);
    expect(player.terraformRating).eq(24);
    expect(player.cardsInHand).has.length(3);
    player.playedCards.push(fakeCard({name: 'plus' as CardName, victoryPoints: 2}));
    other.playedCards.push(fakeCard({name: 'minus' as CardName, victoryPoints: -1}));
    expect(pax.getVictoryPoints(player)).eq(0);
  });

  it('Poly Plantae: greenery without oxygen, titanium can pay', () => {
    const poly = new PolyPlantae();
    const [game, player] = withCorp(poly);
    player.megaCredits = 0;
    expect(poly.canAct(player)).is.true;
    poly.action(player);
    runAllActions(game);
    cast(player.popWaitingFor(), SelectPayment).cb(Payment.of({titanium: 5}));
    runAllActions(game);
    const oxygen = game.getOxygenLevel();
    const select = cast(player.popWaitingFor(), SelectSpace);
    select.cb(select.spaces[0]);
    expect(game.getOxygenLevel()).eq(oxygen);
    expect(player.titanium).lessThan(6);
  });

  it('Quash: microbe tags add disease; science tags may cure for TR', () => {
    const quash = new Quash();
    const [game, player] = withCorp(quash);
    expect(quash.resourceCount).eq(2);
    expect(quash.getVictoryPoints()).eq(0);
    player.megaCredits = 10;
    player.onCardPlayed(fakeCard({name: 's' as CardName, tags: [Tag.SCIENCE]}));
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[0].cb();
    runAllActions(game);
    expect(quash.resourceCount).eq(1);
    expect(player.terraformRating).eq(21);
  });

  it('Storyteller Inc.: removes a positive-VP card for that much TR', () => {
    const story = new StorytellerInc();
    const [, player] = withCorp(story);
    const card = fakeCard({name: 'vp2' as CardName, type: CardType.AUTOMATED, victoryPoints: 2});
    player.playedCards.push(card);
    cast(story.action(player), SelectCard).cb([card]);
    expect(player.terraformRating).eq(22);
    expect(player.playedCards.has(card.name)).is.false;
  });

  it('Nitrogen\'r\'us: free conversion of 3 titanium into TR', () => {
    const [, player] = withCorp(new NitrogenRUs());
    expect(EpicHooks.freeActionOption(player)).is.undefined;
    player.titanium = 3;
    const options = cast(EpicHooks.freeActionOption(player), OrOptions);
    options.options[0].cb();
    expect(player.terraformRating).eq(21);
    expect(player.freeActionTaken).is.true;
  });

  it('Cryo and Lorean ignore maximum temperature requirements', () => {
    for (const corp of [new Cryo(), new Lorean()]) {
      const [game, player] = withCorp(corp);
      player.megaCredits = 100;
      setTemperature(game, 0);
      expect(player.canPlay(new ArcticAlgae())).is.true;
    }
    const [game, plain] = withCorp(new Marsanto());
    plain.megaCredits = 100;
    setTemperature(game, 0);
    expect(plain.canPlay(new ArcticAlgae())).is.false;
  });

  it('Landmark Achievements: free first award, then TR / cards on later ones', () => {
    const landmark = new LandmarkAchievements();
    const [game, player, other] = withCorp(landmark);
    const tr = player.terraformRating;
    cast(landmark.initialAction(player), OrOptions).options[0].cb();
    expect(game.fundedAwards).has.length(1);
    expect(player.terraformRating).eq(tr);
    game.fundAward(other, game.awards.find((a) => !game.hasBeenFunded(a))!);
    expect(player.cardsInHand).has.length(2);
    game.fundAward(player, game.awards.find((a) => !game.hasBeenFunded(a))!);
    expect(player.terraformRating).eq(tr + 1);
  });

  it('January Computational Network: a full set raises a production', () => {
    const jcn = new JanuaryComputationalNetwork();
    const [game, player] = withCorp(jcn);
    player.popWaitingFor();
    for (const type of [CardType.EVENT, CardType.AUTOMATED, CardType.ACTIVE]) {
      jcn.onCardPlayed(player, fakeCard({name: type as unknown as CardName, type}));
    }
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb();
    expect(player.production.steel).eq(1);
  });

  it('Omega Corporation: uses an opponent\'s blue card action', () => {
    const omega = new OmegaCorporation();
    const [, player, other] = withCorp(omega);
    const tardigrades = new Tardigrades();
    other.playedCards.push(tardigrades);
    other.actionsThisGeneration.add(tardigrades.name);
    expect(omega.canAct(player)).is.true;
    cast(omega.action(player), SelectCard).cb([tardigrades]);
    runAllActions(player.game);
    expect(tardigrades.resourceCount).eq(1);
  });

  it('Redux: returns an automated card to hand for 6 M€', () => {
    const redux = new Redux();
    const [game, player] = withCorp(redux);
    const card = fakeCard({name: 'green' as CardName, type: CardType.AUTOMATED});
    player.playedCards.push(card);
    player.megaCredits = 10;
    cast(redux.action(player), SelectCard).cb([card]);
    runAllActions(game);
    expect(player.cardsInHand).deep.eq([card]);
    expect(player.megaCredits).eq(4);
  });

  it('ROD Association: selling patents pays per tag', () => {
    const [, player] = withCorp(new RODAssociation());
    const card = fakeCard({name: 'sp' as CardName, tags: [Tag.SPACE, Tag.BUILDING, Tag.EARTH]});
    player.cardsInHand.push(card);
    const mc = player.megaCredits;
    cast(new SellPatentsStandardProject().action(player), SelectCard).cb([card]);
    expect(player.titanium).eq(1);
    expect(player.steel).eq(1);
    expect(player.megaCredits).eq(mc + 1 + 2);
  });

  it('Talos Foundation: discard 4 cards for production', () => {
    const talos = new TalosFoundation();
    const [game, player] = withCorp(talos);
    player.cardsInHand.push(...game.projectDeck.drawN(game, 4));
    const choice = cast(cast(talos.action(player), SelectCard).cb(player.cardsInHand.slice()), OrOptions);
    choice.options[0].cb();
    expect(player.production.heat).eq(2);
    expect(player.cardsInHand).is.empty;
  });

  it('Chance Synergetics: non-events are discarded for 1 M€', () => {
    const chance = new ChanceSynergetics();
    const [game, player] = withCorp(chance);
    const birds = new Birds();
    game.projectDeck.drawPile.push(birds);
    const mc = player.megaCredits;
    chance.action(player);
    expect(player.megaCredits).eq(mc + 1);
    expect(game.projectDeck.discardPile).includes(birds);
  });
});
