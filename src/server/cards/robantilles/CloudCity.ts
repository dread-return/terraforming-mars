import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {resource} from '../render/DynamicVictoryPoints';

/** Rob Antilles H19. Needs the Venus map (Venus Phase 2) for its city. */
export class CloudCity extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CLOUD_CITY_RA,
      tags: [Tag.VENUS, Tag.CITY, Tag.SPACE],
      cost: 24,
      requirements: {venus: 12},
      victoryPoints: 'special',

      behavior: {
        venusMap: {city: 1},
      },

      action: {
        addResourcesToAnyCard: [
          {count: 1, type: CardResource.FLOATER},
          {count: 1, type: CardResource.FLOATER},
        ],
      },

      metadata: {
        cardNumber: 'H19',
        renderData: CardRenderer.builder((b) => {
          b.action('Add up to 2 floaters to any card(s).', (eb) => {
            eb.empty().startAction.resource(CardResource.FLOATER, 2).asterix();
          }).br;
          b.city().asterix();
          b.vpText('1 VP for each card you have with at least 1 floater.');
        }),
        description: 'Requires 12% Venus. Place a city on Venus.',
        victoryPoints: resource(CardResource.FLOATER, 1, 1),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    return player.getCardsWithResources(CardResource.FLOATER).length;
  }
}
