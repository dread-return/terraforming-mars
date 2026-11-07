import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard, ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {message} from '../../logs/MessageBuilder';

const SPENDABLE = [Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT] as const;

export class Centrifuge extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CENTRIFUGE,
      tags: [Tag.RADIOACTIVE, Tag.WILD],
      cost: 23,
      resourceType: CardResource.RADIATION,
      victoryPoints: {resourcesHere: {}, per: 4},

      metadata: {
        cardNumber: 'N56',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend a standard resource (not M€) to add a radiation to ANY card.', (eb) => {
            eb.wild(1).asterix().startAction.resource(CardResource.RADIATION).asterix();
          }).br;
          b.effect('When you add a radiation to ANY card, gain 1 steel or 1 titanium.', (eb) => {
            eb.resource(CardResource.RADIATION).asterix().startEffect.steel(1).slash().titanium(1);
          });
        }),
        description: '1 VP for every 4 radiation on this card.',
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    return SPENDABLE.some((resource) => player.stock.get(resource) > 0);
  }

  public action(player: IPlayer) {
    const options = SPENDABLE
      .filter((resource) => player.stock.get(resource) > 0)
      .map((resource) => new SelectOption(message('Spend 1 ${0}', (b) => b.string(resource))).andThen(() => {
        player.stock.deduct(resource, 1, {log: true});
        player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
        return undefined;
      }));
    if (options.length === 1) {
      return options[0].cb(undefined);
    }
    return new OrOptions(...options);
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard, count: number) {
    if (playedCard.resourceType !== CardResource.RADIATION || count <= 0) {
      return;
    }
    player.defer(new OrOptions(
      new SelectOption(message('Gain ${0} steel', (b) => b.number(count))).andThen(() => {
        player.stock.add(Resource.STEEL, count, {log: true});
        return undefined;
      }),
      new SelectOption(message('Gain ${0} titanium', (b) => b.number(count))).andThen(() => {
        player.stock.add(Resource.TITANIUM, count, {log: true});
        return undefined;
      }),
    ).setTitle(message('${0}: gain steel or titanium', (b) => b.cardName(this.name))));
  }
}
