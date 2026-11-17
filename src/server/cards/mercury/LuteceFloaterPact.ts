import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class LuteceFloaterPact extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.LUTECE_FLOATER_PACT,
      type: CardType.ACTIVE,
      tags: [Tag.VENUS, Tag.JOVIAN, Tag.SPACE],
      cost: 17,
      behavior: {
        global: {venus: 1},
      },
      metadata: {
        cardNumber: 'MM14',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a Jovian tag or raise Venus, add 1 asset to an Act.', (eb) => {
            eb.tag(Tag.JOVIAN).slash().venus(1).startEffect.asset(1);
          }).br;
          b.venus(1);
        }),
        description: 'Raise Venus 1 step.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.JOVIAN).length;
    if (count > 0) {
      Mercury.gainAssets(player, count);
    }
    return undefined;
  }

  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter) {
    if (parameter === GlobalParameter.VENUS) {
      Mercury.gainAssets(player, 1);
    }
  }
}
