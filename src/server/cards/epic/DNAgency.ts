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

type Life = 'plants' | CardResource.ANIMAL | CardResource.MICROBE;

export class DNAgency extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.DNAGENCY,
      tags: [Tag.SCIENCE, Tag.MICROBE],
      startingMegaCredits: 45,
      action: {},

      behavior: {
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-DNA',
        description: 'You start with 45 M€ and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(45).production((pb) => pb.plants(1));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Remove 1 of your animals, plants or microbes and add 1 animal, plant or microbe elsewhere.', (eb) => {
              eb.resource(CardResource.ANIMAL).plants(1).resource(CardResource.MICROBE).startAction.text('move 1').asterix();
            });
          });
        }),
      },
    });
  }

  private sources(player: IPlayer): Array<{label: string, remove: () => void, kind: Life, card?: ICard}> {
    const result: Array<{label: string, remove: () => void, kind: Life, card?: ICard}> = [];
    if (player.plants > 0) {
      result.push({label: 'a plant', kind: 'plants', remove: () => player.stock.deduct(Resource.PLANTS, 1, {log: true})});
    }
    for (const type of [CardResource.ANIMAL, CardResource.MICROBE] as const) {
      for (const card of player.getCardsWithResources(type)) {
        result.push({label: `1 ${type.toLowerCase()} from ${card.name}`, kind: type, card, remove: () => player.removeResourceFrom(card, 1, {log: true})});
      }
    }
    return result;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.sources(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const sources = this.sources(player);
    return new OrOptions(...sources.map((source) => new SelectOption(`Remove ${source.label}`).andThen(() => {
      source.remove();
      const targets: Array<SelectOption> = [];
      if (source.kind !== 'plants') {
        targets.push(new SelectOption('Gain 1 plant').andThen(() => {
          player.stock.add(Resource.PLANTS, 1, {log: true});
          return undefined;
        }));
      }
      for (const type of [CardResource.ANIMAL, CardResource.MICROBE]) {
        const cards = player.getResourceCards(type).filter((c) => c !== source.card);
        if (cards.length > 0) {
          targets.push(new SelectOption(`Add 1 ${type.toLowerCase()} to a card`).andThen(() => {
            return new SelectCard(`Add 1 ${type.toLowerCase()}`, 'Add', cards).andThen(([card]) => {
              player.addResourceTo(card, {qty: 1, log: true});
              return undefined;
            });
          }));
        }
      }
      if (targets.length === 0) {
        return undefined;
      }
      return targets.length === 1 ? targets[0].cb(undefined) : new OrOptions(...targets).setTitle('DNAgency: where does it go?');
    }))).setTitle('DNAgency: remove 1 animal, plant or microbe');
  }
}
