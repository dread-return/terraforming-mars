import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {TRSource} from '../../../common/cards/TRSource';

export class MuseumOfTerraformation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MUSEUM_OF_TERRAFORMATION,
      tags: [Tag.BUILDING],
      cost: 8,

      metadata: {
        cardNumber: 'I06',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).slash().text('maxed').asterix();
        }),
        description: 'Raise your TR 1 step for every maxed global parameter (temperature, oxygen, oceans, Venus).',
      },
    });
  }

  public static maxedParameters(player: IPlayer): number {
    const game = player.game;
    let count = 0;
    if (game.getTemperature() >= game.max.temperature) {
      count++;
    }
    if (game.getOxygenLevel() >= game.max.oxygen) {
      count++;
    }
    if (!game.canAddOcean()) {
      count++;
    }
    if (game.gameOptions.venusNextExtension && game.getVenusScaleLevel() >= game.max.venus) {
      count++;
    }
    return count;
  }

  public computeTr(player: IPlayer): TRSource {
    return {tr: MuseumOfTerraformation.maxedParameters(player)};
  }

  public override bespokePlay(player: IPlayer) {
    const steps = MuseumOfTerraformation.maxedParameters(player);
    if (steps > 0) {
      player.increaseTerraformRating(steps, {log: true});
    }
    return undefined;
  }
}
