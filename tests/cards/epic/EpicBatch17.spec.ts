import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {Phase} from '../../../src/common/Phase';
import {Tag} from '../../../src/common/cards/Tag';
import {ICorporationCard} from '../../../src/server/cards/corporation/ICorporationCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {EpicHooks} from '../../../src/server/cards/epic/EpicHooks';
import {AchievementUnlocked} from '../../../src/server/cards/epic/AchievementUnlocked';
import {UNVenusInitiative} from '../../../src/server/cards/epic/UNVenusInitiative';
import {GeneralProducts} from '../../../src/server/cards/epic/GeneralProducts';
import {Terraformer} from '../../../src/server/milestones/Terraformer';
import {Mayor} from '../../../src/server/milestones/Mayor';
import {Gardener} from '../../../src/server/milestones/Gardener';
import {Builder} from '../../../src/server/milestones/Builder';
import {GHGImportFromVenus} from '../../../src/server/cards/venusNext/GHGImportFromVenus';
import {AirScrappingStandardProject} from '../../../src/server/cards/venusNext/AirScrappingStandardProject';
import {Algae} from '../../../src/server/cards/base/Algae';
import {Donation} from '../../../src/server/cards/prelude/Donation';
import {IoMiningIndustries} from '../../../src/server/cards/base/IoMiningIndustries';
import {SpaceStation} from '../../../src/server/cards/base/SpaceStation';
import {calculateVictoryPoints} from '../../../src/server/game/calculateVictoryPoints';

function withCorp(corp: ICorporationCard, options = {}): [IGame, TestPlayer, TestPlayer] {
  const [game, player, other] = testGame(2, options);
  player.playCorporationCard(corp);
  runAllActions(game);
  game.phase = Phase.ACTION;
  return [game, player, other];
}

describe('Epic Corporations batch 17', () => {
  it('Achievement Unlocked: claims milestones others claimed and beyond 3; extra and shared claims are 2 VP', () => {
    const corp = new AchievementUnlocked();
    const [game, player, other] = withCorp(corp);
    const terraformer = game.milestones.find((m) => m.name === new Terraformer().name) ?? new Terraformer();
    const milestones = [terraformer, new Mayor(), new Gardener(), new Builder()];
    (game as unknown as {milestones: Array<unknown>}).milestones = milestones;
    // The other player claims Terraformer first.
    game.claimedMilestones.push({player: other, milestone: milestones[0]});
    // Two more claimed by the other player: all 3 slots used.
    game.claimedMilestones.push({player: other, milestone: milestones[1]});
    game.claimedMilestones.push({player: other, milestone: milestones[2]});
    expect(game.allMilestonesClaimed()).is.true;

    player.megaCredits = 100;
    player.setTerraformRating(40);
    expect(player.claimableMilestones().map((m) => m.name)).contains(milestones[0].name);
    // Others are blocked once 3 are claimed.
    other.setTerraformRating(40);
    expect(other.claimableMilestones()).is.empty;

    // A shared claim and a 4th claim: 2 VP each.
    game.claimedMilestones.push({player, milestone: milestones[0]});
    game.claimedMilestones.push({player, milestone: milestones[3]});
    expect(player.claimableMilestones().map((m) => m.name)).not.contains(milestones[0].name);
    expect(calculateVictoryPoints(player).milestones).eq(4);
    expect(calculateVictoryPoints(other).milestones).eq(15);
    expect(game.allMilestonesClaimed()).is.true;
  });

  it('Achievement Unlocked: one of the first 3 claims is still 5 VP; shared claims don\'t use a slot', () => {
    const corp = new AchievementUnlocked();
    const [game, player, other] = withCorp(corp);
    const [a, b] = [new Terraformer(), new Mayor()];
    game.claimedMilestones.push({player: other, milestone: a});
    game.claimedMilestones.push({player, milestone: a});
    game.claimedMilestones.push({player, milestone: b});
    expect(calculateVictoryPoints(player).milestones).eq(2 + 5);
    expect(game.allMilestonesClaimed()).is.false;
  });

  it('Achievement Unlocked: draws 1 prelude and discards 1 with Prelude', () => {
    const corp = new AchievementUnlocked();
    const [game, player] = testGame(2, {preludeExtension: true});
    player.preludeCardsInHand.push(new Donation(), new Donation());
    player.playedCards.push(corp);
    player.defer(corp.play(player));
    runAllActions(game);
    const select = cast(player.popWaitingFor(), SelectCard);
    expect(select.cards).has.length(3);
    select.cb([select.cards[2]]);
    expect(player.preludeCardsInHand).has.length(2);
  });

  it('UN Venus Initiative: 5 Venus funds each production; they only pay for Venus raising', () => {
    const corp = new UNVenusInitiative();
    const [, player] = withCorp(corp, {venusNextExtension: true});
    EpicHooks.afterProduction(player);
    expect(corp.resourceCount).eq(5);
    expect(EpicHooks.epicPayment(player, new GHGImportFromVenus())?.value).eq(1);
    expect(EpicHooks.epicPayment(player, new AirScrappingStandardProject())?.value).eq(1);
    expect(EpicHooks.epicPayment(player, new Algae())).is.undefined;
  });

  it('General Products: adds fighters, moves one to a space card for +1 M€ production and 1 VP', () => {
    const corp = new GeneralProducts();
    const [game, player] = withCorp(corp);
    cast(corp.action(player), SelectOption).cb(undefined);
    runAllActions(game);
    expect(corp.resourceCount).eq(1);

    const station = new SpaceStation();
    player.playedCards.push(station, new IoMiningIndustries(), new Algae());
    const choice = cast(corp.action(player), OrOptions);
    const select = cast(choice.options[1].cb(), SelectCard);
    expect(select.cards.map((c) => c.name)).deep.eq([station.name, new IoMiningIndustries().name]);
    select.cb([station]);
    expect(corp.resourceCount).eq(0);
    expect(player.production.megacredits).eq(1);
    expect(corp.getVictoryPoints(player)).eq(1);
    void Tag;
  });
});
