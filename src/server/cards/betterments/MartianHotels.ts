import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class MartianHotels extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MARTIAN_HOTELS,
      tags: [Tag.BUILDING],
      cost: 8,

      metadata: {
        cardNumber: 'B18',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(5).slash().text('2').tag(Tag.BUILDING).br;
          b.megacredits(1, {all}).slash().tag(Tag.BUILDING, {all});
        }),
        description: 'Gain 5 M€ for each pair of building tags you have, including this. Each other player gains 1 M€ for each building tag they have.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // The card being played isn't in the tableau yet, so add its own tag.
    const mine = player.tags.count(Tag.BUILDING) + 1;
    player.stock.add(Resource.MEGACREDITS, 5 * Math.floor(mine / 2), {log: true});
    for (const opponent of player.opponents) {
      opponent.stock.add(Resource.MEGACREDITS, 1 * opponent.tags.count(Tag.BUILDING), {log: true});
    }
    return undefined;
  }
}
