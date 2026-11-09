import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Resource} from '../../../common/Resource';
import {isVenusStandardProject} from './VenusStandardProject';

export class ImprovedFloatingSystems extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.IMPROVED_FLOATING_SYSTEMS,
      tags: [Tag.VENUS],
      cost: 7,
      requirements: {tag: Tag.SCIENCE},

      metadata: {
        cardNumber: 'V57',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you use a Venus standard project, gain 3 M€.', (eb) => {
            eb.text('Venus SP').startEffect.megacredits(3);
          });
        }),
        description: 'Requires a science tag.',
      },
    });
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (isVenusStandardProject(project)) {
      player.stock.add(Resource.MEGACREDITS, 3, {log: true, from: {card: this}});
    }
  }
}
