import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';

export class InvestmentInsurance extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.INVESTMENT_INSURANCE,
      tags: [Tag.EARTH],
      cost: 5,

      behavior: {
        production: {megacredits: -1},
      },

      metadata: {
        cardNumber: 'I21',
        renderData: CardRenderer.builder((b) => {
          b.effect('In the production phase, increase your M€ production 1 step if you didn\'t increase it this generation.', (eb) => {
            eb.text('prod').asterix().startEffect.production((pb) => pb.megacredits(1));
          }).br;
          b.production((pb) => pb.megacredits(-1));
        }),
        description: 'Decrease your M€ production 1 step.',
      },
    });
  }

  public data = {
    /** The last generation in which the owner's M€ production went up (other than from this card). */
    lastIncrease: -1,
    applying: false,
  };

  public onProductionGain(player: IPlayer, resource: Resource, amount: number) {
    if (resource === Resource.MEGACREDITS && amount > 0 && !this.data.applying) {
      this.data.lastIncrease = player.game.generation;
    }
  }

  public onProductionPhase(player: IPlayer) {
    if (this.data.lastIncrease === player.game.generation) {
      return;
    }
    this.data.applying = true;
    player.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
    this.data.applying = false;
  }
}
