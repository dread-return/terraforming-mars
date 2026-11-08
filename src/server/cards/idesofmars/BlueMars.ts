import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class BlueMars extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BLUE_MARS,
      tags: [Tag.MARS],
      cost: 2,
      requirements: {display: 'allOceans'},

      metadata: {
        cardNumber: 'I58',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever you would place an ocean tile, raise your TR 1 step instead.', (eb) => {
            eb.oceans(1).asterix().startEffect.tr(1);
          });
        }),
        description: 'Requires that all oceans have been placed.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return !player.game.canAddOcean();
  }
}
