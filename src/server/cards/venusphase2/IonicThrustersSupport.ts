import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {VenusPhase2Expansion} from '../../venus2/VenusPhase2Expansion';
import {all} from '../Options';

export class IonicThrustersSupport extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.IONIC_THRUSTERS_SUPPORT,
      tags: [Tag.VENUS],
      cost: 17,

      metadata: {
        cardNumber: 'V64',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1)).slash().resource(CardResource.FLOATER, {amount: 2, all}).asterix();
        }),
        description: 'Increase your M€ production 1 step for every 2 floaters any ONE opponent has.',
      },
    });
  }

  /** You pick the opponent; the best pick is the one with the most floaters. */
  private static mostFloaters(player: IPlayer): number {
    return Math.max(0, ...player.opponents.map((opponent) => VenusPhase2Expansion.floatersOnCards(opponent)));
  }

  public override bespokePlay(player: IPlayer) {
    const count = Math.floor(IonicThrustersSupport.mostFloaters(player) / 2);
    player.production.add(Resource.MEGACREDITS, count, {log: true});
    return undefined;
  }
}
