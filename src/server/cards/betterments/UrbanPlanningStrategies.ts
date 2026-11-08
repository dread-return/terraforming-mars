import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {BettermentsUtils} from './BettermentsUtils';
import {all, digit} from '../Options';

export class UrbanPlanningStrategies extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.URBAN_PLANNING_STRATEGIES,
      tags: [Tag.BUILDING],
      cost: 15,

      metadata: {
        cardNumber: 'B42',
        renderData: CardRenderer.builder((b) => {
          b.city().asterix().colon().oceans(1, {size: Size.SMALL}).greenery({size: Size.SMALL, withO2: false}).greenery({size: Size.SMALL, withO2: false}).br;
          b.tr(2, {digit}).slash().city().asterix().br;
          b.tr(1, {all}).slash().city({all}).asterix();
        }),
        description: '*A city next to at least one ocean and 2 greeneries. Raise your TR 2 steps for each such city you own. ' +
          'Each other player raises their TR 1 step for each such city they own.',
      },
    });
  }

  public static qualifyingCities(player: IPlayer): number {
    return BettermentsUtils.citiesOnMars(player)
      .filter((space) => BettermentsUtils.adjacentOceans(player, space) >= 1)
      .filter((space) => BettermentsUtils.adjacentGreeneries(player, space) >= 2)
      .length;
  }

  public computeTr(player: IPlayer) {
    return {tr: 2 * UrbanPlanningStrategies.qualifyingCities(player)};
  }

  public override bespokePlay(player: IPlayer) {
    const mine = 2 * UrbanPlanningStrategies.qualifyingCities(player);
    if (mine > 0) {
      player.increaseTerraformRating(mine, {log: true});
    }
    for (const opponent of player.opponents) {
      const theirs = UrbanPlanningStrategies.qualifyingCities(opponent);
      if (theirs > 0) {
        opponent.increaseTerraformRating(theirs, {log: true});
      }
    }
    return undefined;
  }
}
