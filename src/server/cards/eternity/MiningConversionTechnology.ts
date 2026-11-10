import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class MiningConversionTechnology extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MINING_CONVERSION_TECHNOLOGY,
      tags: [Tag.SCIENCE],
      cost: 13,
      resourceType: CardResource.SCIENCE,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'E90',
        renderData: CardRenderer.builder((b) => {
          b.action(undefined, (eb) => eb.resource(CardResource.SCIENCE).startAction.wild(1)).br;
          b.or().br;
          b.action('Spend 1 (or 2) science here for 1 (or 2) of a standard resource.', (eb) => eb.resource(CardResource.SCIENCE, 2).startAction.wild(2)).br;
          b.effect('Placement bonus: 1 science here.', (eb) => eb.emptyTile().asterix().startEffect.resource(CardResource.SCIENCE));
        }),
      },
    });
  }

  public canAct() {
    return this.resourceCount > 0;
  }
  public action(player: IPlayer) {
    const pick = (n: number) => new OrOptions(...[Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT].map((r) => new SelectOption(r).andThen(() => {
      player.removeResourceFrom(this, n);
      player.stock.add(r, n, {log: true});
      return undefined;
    }))).setTitle('Remove ' + n + ' science resource(s) to gain ' + n + ' of a standard resource');
    if (this.resourceCount < 2) {
      return pick(1);
    }
    return new OrOptions(new SelectOption('Remove 1 science resource').andThen(() => pick(1)), new SelectOption('Remove 2 science resources').andThen(() => pick(2)));
  }
  public onStandardResourcePlacementBonus(cardOwner: IPlayer, activePlayer: IPlayer, _space: Space, _resource: Resource) {
    if (cardOwner === activePlayer) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
