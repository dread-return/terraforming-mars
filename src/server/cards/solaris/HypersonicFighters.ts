import {IActionCard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';

const OPTIONS: ReadonlyArray<[Resource, number]> = [
  [Resource.MEGACREDITS, 1],
  [Resource.STEEL, 2],
  [Resource.TITANIUM, 3],
];

export class HypersonicFighters extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HYPERSONIC_FIGHTERS,
      tags: [Tag.EARTH, Tag.SPACE],
      cost: 8,
      requirements: {oxygen: 2},
      resourceType: CardResource.FIGHTER,
      // The card's VP badge says 1 per 4 (the text says 1 per 3). Leo chose the badge.
      victoryPoints: {resourcesHere: {}, per: 4},

      metadata: {
        cardNumber: 'S45',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 M€, 1 steel or 1 titanium to add 1, 2 or 3 fighters to this card respectively.', (eb) => {
            eb.megacredits(1).slash().steel(1).slash().titanium(1).startAction.text('1/2/3').resource(CardResource.FIGHTER);
          }).br;
          b.vpText('1 VP for every 4 fighters on this card.');
        }),
        description: 'Requires 2% oxygen.',
      },
    });
  }

  private available(player: IPlayer) {
    return OPTIONS.filter(([resource]) => {
      if (resource === Resource.MEGACREDITS) {
        return player.canAfford(1);
      }
      return player.stock.get(resource) >= 1;
    });
  }

  public canAct(player: IPlayer): boolean {
    return this.available(player).length > 0;
  }

  public action(player: IPlayer) {
    const options = this.available(player).map(([resource, fighters]) =>
      new SelectOption(`Spend 1 ${resource} to add ${fighters} fighter(s)`).andThen(() => {
        if (resource === Resource.MEGACREDITS) {
          player.game.defer(new SelectPaymentDeferred(player, 1, {title: 'Select how to pay for Hypersonic Fighters'}))
            .andThen(() => player.addResourceTo(this, {qty: fighters, log: true}));
        } else {
          player.stock.deduct(resource, 1);
          player.addResourceTo(this, {qty: fighters, log: true});
        }
        return undefined;
      }));
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options);
  }
}
