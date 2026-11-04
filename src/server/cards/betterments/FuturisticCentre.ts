import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';

export class FuturisticCentre extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FUTURISTIC_CENTRE,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      cost: 18,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'B01',
        renderData: CardRenderer.builder((b) => {
          b.effect('During the research phase, you pay 1 M€ less for each card you buy.', (eb) => {
            eb.cards(1).asterix().startEffect.megacredits(-1);
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.cardCost = Math.max(0, player.cardCost - 1);
    return undefined;
  }
}
