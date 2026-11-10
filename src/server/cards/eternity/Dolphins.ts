import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {GlobalParameter} from '../../../common/GlobalParameter';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class Dolphins extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.DOLPHINS,
      tags: [Tag.ANIMAL],
      cost: 8,
      resourceType: CardResource.ANIMAL,
      requirements: [{temperature: 0}, {oceans: 1}, {oxygen: 8}],
      victoryPoints: {resourcesHere: {}, per: 2},
      metadata: {
        cardNumber: 'E64',
        renderData: CardRenderer.builder((b) => {
          b.effect('When anyone places an ocean or raises the temperature, add 1 animal here.', (eb) => eb.oceans(1, {all}).slash().temperature(1, {all}).startEffect.resource(CardResource.ANIMAL));
        }),
        description: 'Requires 0 \u00b0C or warmer, 1 ocean and 8% oxygen. 1 VP per 2 animals here.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType === BoardType.MARS && Board.isOceanSpace(space)) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
  public onGlobalParameterIncrease(player: IPlayer, parameter: GlobalParameter, steps: number) {
    // Called for the active player's tableau only; Dolphins counts anyone's raises (see Eternity hooks).
    if (parameter === GlobalParameter.TEMPERATURE) {
      player.addResourceTo(this, {qty: steps, log: true});
    }
  }
}
