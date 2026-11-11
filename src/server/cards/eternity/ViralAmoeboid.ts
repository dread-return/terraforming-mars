import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class ViralAmoeboid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.VIRAL_AMOEBOID,
      tags: [Tag.MICROBE, Tag.MICROBE],
      cost: 8,
      resourceType: CardResource.MICROBE,
      victoryPoints: {resourcesHere: {}, per: 3},
      metadata: {
        cardNumber: 'E139',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any player plays a microbe tag, including each tag on this, add a microbe here.', (eb) => eb.tag(Tag.MICROBE, {all}).startEffect.resource(CardResource.MICROBE));
        }),
        description: '1 VP per 3 microbes here.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(owner: IPlayer, card: ICard) {
    const n = card.tags.filter((t) => t === Tag.MICROBE).length;
    if (n > 0) {
      owner.addResourceTo(this, {qty: n, log: true});
    }
    return undefined;
  }
}
