import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {all, digit} from '../Options';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';

export class SolarFlare extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SOLAR_FLARE,
      tags: [Tag.RADIOACTIVE, Tag.SPACE],
      cost: 18,
      behavior: {
        global: {temperature: 1},
        removeAnyPlants: 2,
      },

      metadata: {
        cardNumber: 'N11',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).br;
          b.minus().plants(2, {all}).nbsp.resource(CardResource.ANIMAL, {all}).nbsp.resource(CardResource.RADIATION, {amount: 2, all, digit});
        }),
        description: 'Raise the temperature 1 step. Remove 2 plants, 1 animal and 2 radiation from any player or players.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {mandatory: false}));
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.RADIATION, 2, {mandatory: false}));
    return undefined;
  }
}
