import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Phase} from '../../../common/Phase';

export class Amphibians extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.AMPHIBIANS,
      tags: [Tag.ANIMAL],
      cost: 7,
      requirements: {temperature: -12},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}},

      metadata: {
        cardNumber: 'I41',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place an ocean tile, add an animal to this card.', (eb) => {
            eb.oceans(1).startEffect.resource(CardResource.ANIMAL);
          }).br;
          b.vpText('1 VP for every animal on this card.');
        }),
        description: 'Requires -12 °C or warmer.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner !== activePlayer || cardOwner.game.phase === Phase.SOLAR) {
      return;
    }
    if (Board.isOceanSpace(space)) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
