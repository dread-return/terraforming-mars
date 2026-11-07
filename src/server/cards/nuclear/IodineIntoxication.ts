import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Nuclear} from './Nuclear';
import {all} from '../Options';

export class IodineIntoxication extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.IODINE_INTOXICATION,
      tags: [Tag.RADIOACTIVE],
      cost: 16,
      resourceType: CardResource.RADIATION,
      behavior: {addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},

      action: {
        or: {
          behaviors: [
            {title: 'Add a radiation to ANY card', addResourcesToAnyCard: {type: CardResource.RADIATION, count: 1}},
            {title: 'Remove 2 radiation here to gain 3 energy and 1 heat', spend: {resourcesHere: 2}, stock: {energy: 3, heat: 1}},
            {title: 'Remove 2 radiation here to remove 2 plants from an opponent', spend: {resourcesHere: 2}, removeAnyPlants: 2},
          ],
        },
      },

      metadata: {
        cardNumber: 'N53',
        renderData: CardRenderer.builder((b) => {
          b.action('Add a radiation to ANY card.', (eb) => {
            eb.empty().startAction.resource(CardResource.RADIATION).asterix();
          }).br;
          b.or().br;
          b.action('Remove 2 radiation here to gain 3 energy and 1 heat, or to remove 2 plants from an opponent.', (eb) => {
            eb.resource(CardResource.RADIATION, 2).startAction.energy(3).heat(1).slash().minus().plants(2, {all});
          }).br;
          b.resource(CardResource.RADIATION).asterix();
        }),
        description: 'Requires that you have at least 3 radiation. Add a radiation to ANY card.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return Nuclear.radiationCount(player) >= 3;
  }
}
