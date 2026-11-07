import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Nuclear} from './Nuclear';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';

export class TritiumStation extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.TRITIUM_STATION,
      tags: [Tag.RADIOACTIVE],
      cost: 20,
      requirements: {oxygen: 8},
      behavior: {ocean: {}},

      metadata: {
        cardNumber: 'N43',
        renderData: CardRenderer.builder((b) => {
          b.action('If you raised your TR this generation, remove 2 radiation from your cards to raise your TR 1 step.', (eb) => {
            eb.resource(CardResource.RADIATION, 2).asterix().startAction.tr(1);
          }).br;
          b.oceans(1);
        }),
        description: 'Requires 8% oxygen. Place an ocean tile.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return player.hasIncreasedTerraformRatingThisGeneration &&
      Nuclear.radiationCount(player) >= 2 &&
      player.canAfford({cost: 0, tr: {tr: 1}});
  }

  public action(player: IPlayer) {
    const options = {source: 'self', blockable: false, title: 'Select a card to remove a radiation from'} as const;
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.RADIATION, 1, options));
    player.game.defer(new RemoveResourcesFromCard(player, CardResource.RADIATION, 1, options)).andThen(() => {
      player.increaseTerraformRating(1, {log: true});
    });
    return undefined;
  }
}
