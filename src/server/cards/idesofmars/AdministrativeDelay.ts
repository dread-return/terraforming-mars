import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Size} from '../../../common/cards/render/Size';

export class AdministrativeDelay extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ADMINISTRATIVE_DELAY,
      cost: 2,

      metadata: {
        cardNumber: 'I16',
        renderData: CardRenderer.builder((b) => {
          b.text('This generation, you can choose to take 0 actions per turn and keep playing.', {size: Size.SMALL, uppercase: true});
        }),
      },
    });
  }

  public generationUsed: number | undefined = undefined;

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    return undefined;
  }
}
