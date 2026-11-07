import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all} from '../Options';

export class Cockroaches extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.COCKROACHES,
      tags: [Tag.RADIOACTIVE, Tag.ANIMAL],
      cost: 15,
      requirements: {oxygen: 6},
      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'N35',
        renderData: CardRenderer.builder((b) => {
          b.action('Add an animal to this card.', (eb) => {
            eb.empty().startAction.resource(CardResource.ANIMAL);
          }).br;
          b.or().br;
          b.action('Remove a radiation from an opponent\'s card to add a radiation to ANY card.', (eb) => {
            eb.resource(CardResource.RADIATION, {all}).startAction.resource(CardResource.RADIATION).asterix();
          });
        }),
        description: 'Requires 6% oxygen. 1 VP for every 2 animals on this card.',
      },
    });
  }

  private opponentsHaveRadiation(player: IPlayer): boolean {
    return player.opponents.some((p) => p.getCardsWithResources(CardResource.RADIATION).length > 0);
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: IPlayer) {
    const addAnimal = new SelectOption('Add an animal to this card').andThen(() => {
      player.addResourceTo(this, {qty: 1, log: true});
      return undefined;
    });
    if (!this.opponentsHaveRadiation(player)) {
      return addAnimal.cb(undefined);
    }
    const moveRadiation = new SelectOption('Move a radiation from an opponent\'s card to ANY card').andThen(() => {
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.RADIATION, 1, {source: 'opponents'}))
        .andThen((response) => {
          if (response.proceed && response.card !== undefined) {
            player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
          }
        });
      return undefined;
    });
    return new OrOptions(addAnimal, moveRadiation);
  }
}
