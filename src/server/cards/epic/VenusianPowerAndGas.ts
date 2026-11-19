import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';

type Source = {label: string, kind: 'heat' | 'energy' | 'floater', card?: ICard, remove: () => void};

export class VenusianPowerAndGas extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.VENUSIAN_POWER_AND_GAS,
      tags: [Tag.POWER, Tag.VENUS],
      startingMegaCredits: 42,
      action: {},

      behavior: {
        production: {heat: 2},
      },

      metadata: {
        cardNumber: 'EP-VPG',
        description: 'You start with 42 M€ and 2 heat production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).production((pb) => pb.heat(2));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Remove 1 of your heat, energy or floaters and add 1 heat, energy or floater elsewhere.', (eb) => {
              eb.heat(1).energy(1).resource(CardResource.FLOATER).startAction.text('move 1').asterix();
            });
          });
        }),
      },
    });
  }

  private sources(player: IPlayer): Array<Source> {
    const result: Array<Source> = [];
    if (player.heat > 0) {
      result.push({label: '1 heat', kind: 'heat', remove: () => player.stock.deduct(Resource.HEAT, 1, {log: true})});
    }
    if (player.energy > 0) {
      result.push({label: '1 energy', kind: 'energy', remove: () => player.stock.deduct(Resource.ENERGY, 1, {log: true})});
    }
    for (const card of player.getCardsWithResources(CardResource.FLOATER)) {
      result.push({label: `1 floater from ${card.name}`, kind: 'floater', card, remove: () => player.removeResourceFrom(card, 1, {log: true})});
    }
    return result;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.sources(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new OrOptions(...this.sources(player).map((source) => new SelectOption(`Remove ${source.label}`).andThen(() => {
      source.remove();
      const targets: Array<SelectOption> = [];
      for (const [kind, resource] of [['heat', Resource.HEAT], ['energy', Resource.ENERGY]] as const) {
        if (source.kind !== kind) {
          targets.push(new SelectOption(`Gain 1 ${kind}`).andThen(() => {
            player.stock.add(resource, 1, {log: true});
            return undefined;
          }));
        }
      }
      const floaterCards = player.getResourceCards(CardResource.FLOATER).filter((c) => c !== source.card);
      if (floaterCards.length > 0) {
        targets.push(new SelectOption('Add 1 floater to a card').andThen(() =>
          new SelectCard('Add 1 floater', 'Add', floaterCards).andThen(([card]) => {
            player.addResourceTo(card, {qty: 1, log: true});
            return undefined;
          })));
      }
      return targets.length === 1 ? targets[0].cb(undefined) : new OrOptions(...targets).setTitle('Venusian Power & Gas: where does it go?');
    }))).setTitle('Venusian Power & Gas: remove 1 heat, energy or floater');
  }
}
