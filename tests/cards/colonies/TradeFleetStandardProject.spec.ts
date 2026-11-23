import {expect} from 'chai';
import {Game} from '../../../src/server/Game';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {CardName} from '../../../src/common/cards/CardName';
import {MAX_FLEET_SIZE} from '../../../src/common/constants';
import {Payment} from '../../../src/common/inputs/Payment';
import {toName} from '../../../src/common/utils/utils';
import {IStandardProjectCard} from '../../../src/server/cards/IStandardProjectCard';
import {runAllActions} from '../../TestingUtils';

describe('TradeFleetStandardProject', () => {
  let game: IGame;
  let player: TestPlayer;
  let player2: TestPlayer;

  function project(): IStandardProjectCard {
    const card = game.standardProjects.find((c) => c.name === CardName.TRADE_FLEET_STANDARD_PROJECT);
    if (card === undefined) {
      throw new Error('Trade Fleet standard project is missing');
    }
    return card;
  }

  function buy(): void {
    const card = project();
    player.megaCredits = 100;
    card.payAndExecute(player, Payment.of({megacredits: card.getAdjustedCost(player)}));
    runAllActions(game);
  }

  beforeEach(() => {
    [game, player, player2] = testGame(2, {coloniesExtension: true, coloniesTradeFleetProject: true});
  });

  it('is offered only with Colonies and the option', () => {
    expect(game.standardProjects.map(toName)).includes(CardName.TRADE_FLEET_STANDARD_PROJECT);

    const [noOption] = testGame(2, {coloniesExtension: true});
    expect(noOption.standardProjects.map(toName)).does.not.include(CardName.TRADE_FLEET_STANDARD_PROJECT);

    const [noColonies] = testGame(2, {coloniesTradeFleetProject: true});
    expect(noColonies.standardProjects.map(toName)).does.not.include(CardName.TRADE_FLEET_STANDARD_PROJECT);
  });

  it('costs 20, then 25, then 30, and adds a fleet each time', () => {
    const card = project();
    expect(player.colonies.getFleetSize()).eq(1);

    expect(card.getAdjustedCost(player)).eq(20);
    buy();
    expect(player.colonies.getFleetSize()).eq(2);
    expect(player.megaCredits).eq(80);

    expect(card.getAdjustedCost(player)).eq(25);
    buy();
    expect(player.colonies.getFleetSize()).eq(3);
    expect(player.megaCredits).eq(75);

    expect(card.getAdjustedCost(player)).eq(30);
    buy();
    expect(player.colonies.getFleetSize()).eq(MAX_FLEET_SIZE);
    expect(player.megaCredits).eq(70);
  });

  it('can be played only while below the maximum fleet size', () => {
    player.megaCredits = 100;
    expect(project().canAct(player)).is.true;

    player.colonies.setFleetSize(MAX_FLEET_SIZE);
    expect(project().canAct(player)).is.false;
  });

  it('needs enough M€', () => {
    player.megaCredits = 19;
    expect(project().canAct(player)).is.false;
    player.megaCredits = 20;
    expect(project().canAct(player)).is.true;
  });

  it('does not raise the price for fleets that came from cards', () => {
    player.colonies.increaseFleetSize();
    expect(project().getAdjustedCost(player)).eq(20);
    buy();
    expect(player.colonies.getFleetSize()).eq(3);
    expect(project().getAdjustedCost(player)).eq(25);
  });

  it('does not raise the price of the other player', () => {
    buy();
    expect(project().getAdjustedCost(player2)).eq(20);
  });

  it('serializes the number of fleets bought', () => {
    buy();
    buy();
    const deserialized = Game.deserialize(game.serialize());
    const loaded = deserialized.getPlayerById(player.id);
    expect(loaded.colonies.fleetsBought).eq(2);
    expect(loaded.colonies.getFleetSize()).eq(3);
  });

  it('loads older saves without a purchase count', () => {
    const serialized = game.serialize();
    for (const p of serialized.players) {
      delete p.fleetsBought;
    }
    const deserialized = Game.deserialize(serialized);
    expect(deserialized.getPlayerById(player.id).colonies.fleetsBought).eq(0);
  });
});
