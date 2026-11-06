import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {all, digit} from '../Options';

export class WaterCleaningBacteria extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.WATER_CLEANING_BACTERIA,
      tags: [Tag.POWER, Tag.MICROBE],
      cost: 14,
      requirements: {temperature: -18},
      resourceType: CardResource.MICROBE,

      behavior: {
        production: {energy: 1},
      },

      action: {
        spend: {resourcesHere: 8},
        ocean: {},
      },

      metadata: {
        cardNumber: 'I52',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any ocean is placed, add 3 microbes here.', (eb) => {
            eb.oceans(1, {all}).startEffect.resource(CardResource.MICROBE, {amount: 3, digit});
          }).br;
          b.action('Remove 8 microbes here to place an ocean.', (eb) => {
            eb.resource(CardResource.MICROBE, {amount: 8, digit}).startAction.oceans(1);
          }).br;
          b.production((pb) => pb.energy(1));
        }),
        description: 'Requires -18 °C. Energy production +1.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isOceanSpace(space)) {
      cardOwner.addResourceTo(this, {qty: 3, log: true});
    }
  }
}
