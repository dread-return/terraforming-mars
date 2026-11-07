import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class PropagandaConference extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.PROPAGANDA_CONFERENCE,
      tags: [Tag.EARTH],
      cost: 4,
      behavior: {production: {megacredits: 1}},

      metadata: {
        cardNumber: 'N29',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).nbsp.text('next standard project: -8 M€');
        }),
        description: 'Increase your M€ production 1 step. Your next standard project costs 8 M€ less.',
      },
    });
  }

  public data = {pending: false};

  public override bespokePlay() {
    this.data = {pending: true};
    return undefined;
  }

  public getStandardProjectDiscount(_player: IPlayer, _card: IStandardProjectCard): number {
    return this.data?.pending ? 8 : 0;
  }

  public onStandardProject() {
    this.data = {pending: false};
  }
}
