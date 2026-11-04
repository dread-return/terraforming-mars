import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class AdvancedSchools extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.ADVANCED_SCHOOLS,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 15,

      metadata: {
        cardNumber: 'B39',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(3).slash().tag(Tag.SCIENCE).br;
          b.megacredits(1, {all}).slash().tag(Tag.SCIENCE, {all});
        }),
        description: 'Gain 3 M€ for each science tag you have, including this. Each other player gains 1 M€ for each science tag they have.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // The card being played isn't in the tableau yet, so add its own tag.
    const mine = player.tags.count(Tag.SCIENCE) + 1;
    player.stock.add(Resource.MEGACREDITS, 3 * mine, {log: true});
    for (const opponent of player.opponents) {
      opponent.stock.add(Resource.MEGACREDITS, 1 * opponent.tags.count(Tag.SCIENCE), {log: true});
    }
    return undefined;
  }
}
