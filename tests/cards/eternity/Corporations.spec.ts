import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Resource} from '../../../src/common/Resource';
import {Phase} from '../../../src/common/Phase';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {ColonyName} from '../../../src/common/colonies/ColonyName';
import {DGTMarsCrew} from '../../../src/server/cards/eternity/DGTMarsCrew';
import {OIS} from '../../../src/server/cards/eternity/OIS';
import {GeneralistTerraforma} from '../../../src/server/cards/eternity/GeneralistTerraforma';
import {IOA} from '../../../src/server/cards/eternity/IOA';
import {Jovicorp} from '../../../src/server/cards/eternity/Jovicorp';
import {Powerhouse} from '../../../src/server/cards/eternity/Powerhouse';
import {ShellCorporation} from '../../../src/server/cards/eternity/ShellCorporation';
import {Venusia} from '../../../src/server/cards/eternity/Venusia';
import {TharsisRepublic} from '../../../src/server/cards/corporation/TharsisRepublic';
import {CrediCor} from '../../../src/server/cards/corporation/CrediCor';
import {Vipers} from '../../../src/server/cards/eternity/Vipers';
import {Dolphins} from '../../../src/server/cards/eternity/Dolphins';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {AquiferStandardProject} from '../../../src/server/cards/base/standardProjects/AquiferStandardProject';
import {SelectInitialCards} from '../../../src/server/inputs/SelectInitialCards';
import {Mayor} from '../../../src/server/milestones/Mayor';
import {addCity} from '../../TestingUtils';

describe('Eternity corporations', () => {
  let game: IGame;
  let player: TestPlayer;
  let other: TestPlayer;

  beforeEach(() => {
    [game, player, other] = testGame(2, {eternityExpansion: true});
  });

  it('DGT Mars Crew: passing only ends the turn while others still play; +2 actions', () => {
    player.playCorporationCard(new DGTMarsCrew());
    game.phase = Phase.ACTION;
    player.pass();
    expect(game.hasPassedThisActionPhase(player)).is.false;
    other.pass();
    player.pass();
    expect(game.hasPassedThisActionPhase(player)).is.true;
    const corp = player.playedCards.corporations()[0] as DGTMarsCrew;
    corp.action(player);
    expect(player.availableActionsThisRound).eq(4);
  });

  it('Generalist Terraforma: must keep exactly 5 cards, free; steel and titanium pay for City', () => {
    const corp = new GeneralistTerraforma();
    player.dealtCorporationCards = [corp];
    const input = new SelectInitialCards(player, (c) => {
      player.playCorporationCard(c);
      return undefined;
    });
    const keep = (n: number) => {
      player.cardsInHand = [];
      return () => input.process({type: 'initialCards', responses: [
        {type: 'card', cards: [corp.name]},
        {type: 'card', cards: player.dealtProjectCards.slice(0, n).map((c) => c.name)},
      ]}, player);
    };
    expect(keep(4)).to.throw(/exactly 5/);
    keep(5)();
    expect(player.cardsInHand).has.length(5);
    expect(player.megaCredits).eq(0);
    expect(player.steel).eq(7);
    expect(player.titanium).eq(7);
    player.megaCredits = 0;
    player.steel = 0;
    player.titanium = 9;
    runAllActions(game);
    expect(new CityStandardProject().canAct(player)).is.true;
  });

  it('IOA adds Io, builds a colony there, and trades with Io for free', () => {
    const [g, p] = testGame(2, {eternityExpansion: true, coloniesExtension: true, venusNextExtension: true});
    const ioa = new IOA();
    p.playCorporationCard(ioa);
    ioa.initialAction(p);
    const io = g.colonies.find((c) => c.name === ColonyName.IO);
    expect(io?.colonies).includes(p.id);
    const trade = p.colonies.coloniesTradeAction();
    expect(trade).is.not.undefined;
  });

  it('Jovicorp claims milestones one unit early and steals titanium', () => {
    const corp = new Jovicorp();
    player.playCorporationCard(corp);
    addCity(player);
    addCity(player);
    const mayor = new Mayor();
    expect(mayor.canClaim(player)).is.true;
    expect(mayor.canClaim(other)).is.false;
    other.titanium = 2;
    const options = cast(corp.action(player), OrOptions);
    cast(options.options[1].cb(undefined), OrOptions).options[0].cb(undefined);
    expect(player.titanium).eq(1);
    expect(other.titanium).eq(1);
  });

  it('Powerhouse may switch an energy production increase to steel', () => {
    player.playCorporationCard(new Powerhouse());
    runAllActions(game);
    game.phase = Phase.ACTION;
    const before = player.production.asUnits();
    player.production.add(Resource.ENERGY, 1);
    runAllActions(game);
    cast(player.popWaitingFor(), OrOptions).options[1].cb(undefined);
    expect(player.production.energy).eq(before.energy);
    expect(player.production.steel).eq(before.steel + 1);
  });

  it('Shell Corporation copies an opponent\'s corporation and keeps 7 M€', () => {
    other.playCorporationCard(new TharsisRepublic());
    const shell = new ShellCorporation();
    player.playCorporationCard(shell);
    expect(player.megaCredits).eq(7);
    const options = cast(shell.initialAction(player), OrOptions);
    options.options[0].cb(undefined);
    runAllActions(game);
    expect(player.playedCards.corporations().map((c) => c.name)).deep.eq([new TharsisRepublic().name]);
    expect(player.megaCredits).eq(7);
  });

  it('Venusia: heat pays 2 M€ each for standard projects', () => {
    const [g, p] = testGame(2, {eternityExpansion: true, venusNextExtension: true});
    p.playCorporationCard(new Venusia());
    p.megaCredits = 0;
    p.heat = 9;
    expect(new AquiferStandardProject().canAct(p)).is.true;
    p.heat = 8;
    expect(new AquiferStandardProject().canAct(p)).is.false;
    expect(g).is.not.undefined;
  });

  it('O.I.S.: opponents place cards face up; the owner takes one', () => {
    const ois = new OIS();
    player.playCorporationCard(ois);
    runAllActions(game);
    other.cardsInHand = [new Vipers(), new Dolphins()];
    ois.initialAction(player);
    runAllActions(game);
    cast(other.popWaitingFor(), SelectCard).cb([other.cardsInHand[0]]);
    expect(ois.faceUpCards(other).map((c) => c.name)).deep.eq([new Vipers().name]);
    expect(ois.canAct(player)).is.true;
    cast(ois.action(player), SelectCard).cb([ois.faceUpCards(other)[0]]);
    expect(other.cardsInHand.map((c) => c.name)).deep.eq([new Dolphins().name]);
    expect(player.cardsInHand.map((c) => c.name)).includes(new Vipers().name);
    expect(new CrediCor()).is.not.undefined;
  });
});
