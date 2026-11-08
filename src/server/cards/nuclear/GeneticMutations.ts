import {IProjectCard} from '../IProjectCard';
import {ActionCard} from '../ActionCard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {BoardType} from '../../boards/BoardType';
import {Board} from '../../boards/Board';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all, digit} from '../Options';

export class GeneticMutations extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.GENETIC_MUTATIONS,
      tags: [Tag.RADIOACTIVE, Tag.PLANT],
      cost: 21,
      requirements: [{tag: Tag.RADIOACTIVE, count: 2}, {tag: Tag.PLANT, count: 2}],
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},

      action: {
        or: {
          behaviors: [
            {title: 'Remove 2 radiation here to remove 2 plants from an opponent', spend: {resourcesHere: 2}, removeAnyPlants: 2},
            {
              title: 'Remove 2 radiation here to remove 2 microbes from an opponent',
              spend: {resourcesHere: 2},
              removeResourcesFromAnyCard: {type: CardResource.MICROBE, count: 2, source: 'opponents'},
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'N51',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you place a greenery tile, add a radiation to ANY card.', (eb) => {
            eb.greenery().startEffect.resource(CardResource.RADIATION).asterix();
          }).br;
          b.action('Remove 2 radiation here to remove 2 plants or 2 microbes from an opponent.', (eb) => {
            eb.resource(CardResource.RADIATION, {amount: 2, digit}).startAction.minus().plants(2, {all, digit}).slash().resource(CardResource.MICROBE, {amount: 2, all, digit});
          });
        }),
        description: 'Requires 2 plant tags and 2 radioactive tags. 1 VP for every 4 radiation on this card.',
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (cardOwner === activePlayer && boardType === BoardType.MARS && Board.isGreenerySpace(space)) {
      cardOwner.game.defer(new AddResourcesToCard(cardOwner, CardResource.RADIATION, {count: 1, log: true}));
    }
  }
}
