import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {RandomMAOptionType} from '../../../common/ma/RandomMAOptionType';
import {milestoneManifest} from '../../milestones/Milestones';
import {awardManifest} from '../../awards/Awards';
import {isCompatible} from '../../ma/MAManifest';
import {inplaceRemove} from '../../../common/utils/utils';

export class BattleOverMars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BATTLE_OVER_MARS,
      tags: [Tag.EARTH, Tag.SPACE],
      cost: 3,

      metadata: {
        cardNumber: 'H32',
        renderData: CardRenderer.builder((b) => {
          b.minus().award().slash().milestone().asterix();
        }),
        description: 'Remove an unclaimed milestone or unfunded award from the game. ' +
          'If you play with random milestones and awards, replace it with one of your choice.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    const game = player.game;
    return game.milestones.some((m) => !game.milestoneClaimed(m)) || game.awards.some((a) => !game.hasBeenFunded(a));
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const random = game.gameOptions.randomMA !== RandomMAOptionType.NONE;
    const options = new OrOptions();
    options.title = 'Select a milestone or award to remove';
    for (const milestone of game.milestones.filter((m) => !game.milestoneClaimed(m))) {
      options.options.push(new SelectOption(`Milestone: ${milestone.name}`).andThen(() => {
        inplaceRemove(game.milestones, milestone);
        game.log('${0} removed the ${1} milestone', (b) => b.player(player).milestone(milestone));
        return random ? this.replaceMilestone(player) : undefined;
      }));
    }
    for (const award of game.awards.filter((a) => !game.hasBeenFunded(a))) {
      options.options.push(new SelectOption(`Award: ${award.name}`).andThen(() => {
        inplaceRemove(game.awards, award);
        game.log('${0} removed the ${1} award', (b) => b.player(player).award(award));
        return random ? this.replaceAward(player) : undefined;
      }));
    }
    return options;
  }

  private replaceMilestone(player: IPlayer) {
    const game = player.game;
    const inGame = new Set(game.milestones.map((m) => m.name));
    const names = (Object.keys(milestoneManifest.all) as Array<keyof typeof milestoneManifest.all>)
      .filter((name) => !inGame.has(name) && milestoneManifest.all[name].deprecated !== true && isCompatible(name, milestoneManifest, game.gameOptions));
    const options = new OrOptions();
    options.title = 'Select a new milestone';
    for (const name of names) {
      options.options.push(new SelectOption(name).andThen(() => {
        const milestone = milestoneManifest.createOrThrow(name);
        game.milestones.push(milestone);
        game.log('${0} added the ${1} milestone', (b) => b.player(player).milestone(milestone));
        return undefined;
      }));
    }
    return options.options.length > 0 ? options : undefined;
  }

  private replaceAward(player: IPlayer) {
    const game = player.game;
    const inGame = new Set(game.awards.map((a) => a.name));
    const names = (Object.keys(awardManifest.all) as Array<keyof typeof awardManifest.all>)
      .filter((name) => !inGame.has(name) && awardManifest.all[name].deprecated !== true && isCompatible(name, awardManifest, game.gameOptions));
    const options = new OrOptions();
    options.title = 'Select a new award';
    for (const name of names) {
      options.options.push(new SelectOption(name).andThen(() => {
        const award = awardManifest.createOrThrow(name);
        game.awards.push(award);
        game.log('${0} added the ${1} award', (b) => b.player(player).award(award));
        return undefined;
      }));
    }
    return options.options.length > 0 ? options : undefined;
  }
}
