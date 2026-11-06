import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {all} from '../Options';

export class SpaceTelescope extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SPACE_TELESCOPE,
      tags: [Tag.SPACE, Tag.SCIENCE],
      cost: 9,
      requirements: {tag: Tag.SCIENCE},
      resourceType: CardResource.DATA,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'S09',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any player plays a space event, add 1 data to this card.', (eb) => {
            eb.tag(Tag.SPACE, {all}).tag(Tag.EVENT, {all}).startEffect.resource(CardResource.DATA);
          }).br;
          b.vpText('1 VP for every 2 data on this card.');
        }),
        description: 'Requires a science tag.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT && card.tags.includes(Tag.SPACE)) {
      thisCardOwner.addResourceTo(this, {qty: 1, log: true});
    }
    return undefined;
  }
}
