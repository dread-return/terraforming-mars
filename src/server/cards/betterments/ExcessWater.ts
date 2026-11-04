import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class ExcessWater extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.EXCESS_WATER,
      cost: 8,

      metadata: {
        cardNumber: 'B27',
        renderData: CardRenderer.builder((b) => {
          b.effect('You gain 2 M€ more from each ocean adjacency bonus.', (eb) => {
            eb.emptyTile().oceans(1).startEffect.megacredits(2);
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.oceanBonus += 2;
    return undefined;
  }

  public override bespokeOnDiscard(player: IPlayer) {
    player.oceanBonus -= 2;
  }
}
