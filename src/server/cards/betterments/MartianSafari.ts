import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class MartianSafari extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_SAFARI,
      tags: [Tag.ANIMAL],
      cost: 22,
      requirements: {tag: Tag.ANIMAL},
      victoryPoints: {tag: Tag.ANIMAL},

      metadata: {
        cardNumber: 'B03',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any player plays an animal tag, including this, increase your M€ production 1 step.', (eb) => {
            eb.tag(Tag.ANIMAL, {all}).startEffect.production((pb) => pb.megacredits(1));
          }).br;
          b.vpText('1 VP per animal tag you have.');
        }),
        description: 'Requires that you have an animal tag.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard, activePlayer: IPlayer) {
    const count = activePlayer.tags.cardTagCount(card, Tag.ANIMAL);
    if (count > 0) {
      thisCardOwner.production.add(Resource.MEGACREDITS, count, {log: true});
    }
    return undefined;
  }
}
