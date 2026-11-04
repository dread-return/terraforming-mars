import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class EnergeticInfrastructures extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ENERGETIC_INFRASTRUCTURES,
      tags: [Tag.POWER, Tag.BUILDING],
      cost: 12,

      metadata: {
        cardNumber: 'B47',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(5).slash().tag(Tag.POWER).br;
          b.megacredits(2, {all}).slash().tag(Tag.POWER, {all});
        }),
        description: 'Gain 5 M€ for each power tag you have, including this. Each other player gains 2 M€ for each power tag they have.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // The card being played isn't in the tableau yet, so add its own tag.
    const mine = player.tags.count(Tag.POWER) + 1;
    player.stock.add(Resource.MEGACREDITS, 5 * mine, {log: true});
    for (const opponent of player.opponents) {
      opponent.stock.add(Resource.MEGACREDITS, 2 * opponent.tags.count(Tag.POWER), {log: true});
    }
    return undefined;
  }
}
