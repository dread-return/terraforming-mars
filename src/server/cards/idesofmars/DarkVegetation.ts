import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Resource} from '../../../common/Resource';

export class DarkVegetation extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.DARK_VEGETATION,
      tags: [Tag.PLANT],
      cost: 11,
      requirements: {oxygen: 7},

      metadata: {
        cardNumber: 'I44',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1).heat(1)).nbsp.or().br;
          b.text('3').tag(Tag.PLANT).colon().production((pb) => pb.plants(2));
        }),
        description: 'Requires 7% oxygen. Increase your heat and plant production 1 step, ' +
          'OR increase your plant production 2 steps if you own 3 or more plant tags (including this).',
      },
    });
  }

  private heatAndPlant(player: IPlayer) {
    player.production.add(Resource.HEAT, 1, {log: true});
    player.production.add(Resource.PLANTS, 1, {log: true});
    return undefined;
  }

  public override bespokePlay(player: IPlayer) {
    // This card isn't in play yet, so count its own plant tag.
    const plantTags = player.tags.count(Tag.PLANT) + 1;
    if (plantTags < 3) {
      return this.heatAndPlant(player);
    }
    return new OrOptions(
      new SelectOption('Increase heat and plant production 1 step').andThen(() => this.heatAndPlant(player)),
      new SelectOption('Increase plant production 2 steps').andThen(() => {
        player.production.add(Resource.PLANTS, 2, {log: true});
        return undefined;
      }),
    );
  }
}
