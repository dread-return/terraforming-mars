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

export class GreatOceanLaboratory extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GREAT_OCEAN_LABORATORY,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 20,
      requirements: {oceans: 5},
      victoryPoints: {tag: Tag.MICROBE},

      metadata: {
        cardNumber: 'B16',
        renderData: CardRenderer.builder((b) => {
          b.effect('Whenever any player plays a microbe tag, including this, increase your M€ production 1 step.', (eb) => {
            eb.tag(Tag.MICROBE, {all}).startEffect.production((pb) => pb.megacredits(1));
          }).br;
          b.vpText('1 VP per microbe tag you have.');
        }),
        description: 'Requires 5 ocean tiles.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard, activePlayer: IPlayer) {
    const count = activePlayer.tags.cardTagCount(card, Tag.MICROBE);
    if (count > 0) {
      thisCardOwner.production.add(Resource.MEGACREDITS, count, {log: true});
    }
    return undefined;
  }
}
