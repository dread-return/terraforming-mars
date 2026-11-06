import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class PlotContamination extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PLOT_CONTAMINATION,
      tags: [Tag.PLANT],
      cost: 7,

      metadata: {
        cardNumber: 'I10',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.plants(1, {all})).text('>').production((pb) => pb.plants(1)).colon().production((pb) => pb.plants(1));
        }),
        description: 'If an opponent has a higher plant production than yours, increase your plant production 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const mine = player.production.plants;
    if (player.opponents.some((opponent) => opponent.production.plants > mine)) {
      player.production.add(Resource.PLANTS, 1, {log: true});
    } else {
      player.game.log('No opponent of ${0} has a higher plant production', (b) => b.player(player));
    }
    return undefined;
  }
}
