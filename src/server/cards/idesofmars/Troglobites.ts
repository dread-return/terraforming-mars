import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {RobAntillesTiles} from '../robantilles/RobAntillesTiles';

export class Troglobites extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TROGLOBITES,
      tags: [Tag.ANIMAL],
      cost: 10,
      requirements: {oxygen: 5},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 4, each: 3},

      metadata: {
        cardNumber: 'I39',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a special tile, add an animal to this card.', (eb) => {
            eb.specialTile().startEffect.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('3 VP for every 4 animals on this card.');
        }),
        description: 'Requires 5% oxygen.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner !== activePlayer || boardType !== BoardType.MARS) {
      return;
    }
    if (RobAntillesTiles.isSpecialTile(space)) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
