import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {WaterReservoirData} from './Nuclear';
import {all} from '../Options';

/** The cost penalty is applied by Nuclear.cardCostAdjustment. */
export class WaterReservoirAnalysis extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.WATER_RESERVOIR_ANALYSIS,
      cost: 0,

      metadata: {
        cardNumber: 'N64',
        renderData: CardRenderer.builder((b) => {
          b.tag(Tag.SPACE, {all}).colon().megacredits(5).nbsp.tag(Tag.BUILDING, {all}).colon().megacredits(2);
        }),
        description: 'This generation, the next space-tag card each opponent plays costs 5 M€ more, and their next building-tag card costs 2 M€ more.',
      },
    });
  }

  public data: WaterReservoirData = {used: {}};

  public generationUsed: number | undefined = undefined;

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    this.data = {used: {}};
    return undefined;
  }
}
