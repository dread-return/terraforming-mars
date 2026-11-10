import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {Eternity} from './Eternity';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class MartianPlantFertilizer extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MARTIAN_PLANT_FERTILIZER,
      tags: [Tag.MARS, Tag.PLANT],
      cost: 16,
      requirements: {display: 'plantProduction'},
      metadata: {
        cardNumber: 'E27',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you gain plants from placement bonuses or from any card, gain 1 extra plant.', (eb) => eb.plants(1).asterix().startEffect.plus().plants(1));
        }),
        description: 'Requires that you have plant production.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.production.plants >= 1;
  }
  public onStandardResourcePlacementBonus(cardOwner: IPlayer, activePlayer: IPlayer, _space: Space, resource: Resource) {
    if (cardOwner === activePlayer && resource === Resource.PLANTS) {
      Eternity.onPlantsGained(cardOwner, 'placement');
    }
  }
}
