import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';

export class AppliedResearch extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.APPLIED_RESEARCH,
      tags: [Tag.SCIENCE],
      cost: 9,
      requirements: {tag: Tag.SCIENCE, count: 2},

      metadata: {
        cardNumber: 'I27',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you use a standard project, draw a card. (Selling patents, trading and adding delegates are not standard projects.)', (eb) => {
            eb.plate('Standard projects').startEffect.cards(1);
          });
        }),
        description: 'Requires 2 science tags.',
      },
    });
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name === CardName.SELL_PATENTS_STANDARD_PROJECT) {
      return;
    }
    player.drawCard();
  }
}
