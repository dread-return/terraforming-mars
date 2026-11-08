import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {all} from '../Options';

export class EnvironmentalDisaster extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.ENVIRONMENTAL_DISASTER,
      tags: [Tag.RADIOACTIVE],
      cost: 24,
      requirements: [{tag: Tag.PLANT}, {tag: Tag.ANIMAL}],
      behavior: {
        global: {temperature: 1, oxygen: 1},
        removeAnyPlants: 2,
        addResourcesToAnyCard: {type: CardResource.RADIATION, count: 2},
      },

      metadata: {
        cardNumber: 'N55',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).oxygen(1).br;
          b.minus().plants(2, {all}).resource(CardResource.MICROBE, {all}).resource(CardResource.ANIMAL, {all}).br;
          b.resource(CardResource.RADIATION, 2).asterix();
        }),
        description: 'Requires a plant tag and an animal tag. Raise the temperature and oxygen 1 step. ' +
          'Remove 2 plants, 1 microbe and 1 animal from any player or players. Add 2 radiation to ANY card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.MICROBE, 1, {mandatory: false}));
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {mandatory: false}));
    return undefined;
  }
}
