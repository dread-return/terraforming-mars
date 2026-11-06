import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class Backstabbing extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.BACKSTABBING,
      cost: 7,

      metadata: {
        cardNumber: 'I24',
        renderData: CardRenderer.builder((b) => {
          b.delegates(1).colon().chairman().asterix();
        }),
        description: 'This generation, if you have a delegate in the winning party, you become the chairman instead of the party leader.',
      },
    });
  }

  public generationUsed: number | undefined = undefined;

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    return undefined;
  }
}
