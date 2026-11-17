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
import {keep, LogType} from '../../deferredActions/ChooseCards';

const MATCHING: Record<'plant' | 'microbe' | 'animal', Tag> = {plant: Tag.PLANT, microbe: Tag.MICROBE, animal: Tag.ANIMAL};

export class Helix extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HELIX,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 45,
      resourceType: CardResource.SCIENCE,
      action: {},

      behavior: {
        stock: {plants: 2},
      },

      metadata: {
        cardNumber: 'EP-HLX',
        description: 'You start with 45 M€ and 2 plants.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(45).plants(2);
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('Your science tags: +1 science here.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.resource(CardResource.SCIENCE);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Spend a microbe, plant or animal: reveal 1 card per science here; take one with that tag, or +1 science.', (eb) => {
              eb.resource(CardResource.MICROBE).slash().plants(1).slash().resource(CardResource.ANIMAL).startAction.cards(1).asterix();
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const science = player.tags.cardTagCount(card, Tag.SCIENCE);
    if (science > 0) {
      player.addResourceTo(this, {qty: science, log: true});
    }
  }

  private spendOptions(player: IPlayer): Array<{label: string, kind: keyof typeof MATCHING, spend: () => void}> {
    const result: Array<{label: string, kind: keyof typeof MATCHING, spend: () => void}> = [];
    if (player.plants > 0) {
      result.push({label: 'a plant', kind: 'plant', spend: () => player.stock.deduct(Resource.PLANTS, 1, {log: true})});
    }
    for (const [type, kind] of [[CardResource.MICROBE, 'microbe'], [CardResource.ANIMAL, 'animal']] as const) {
      for (const card of player.getCardsWithResources(type)) {
        result.push({label: `1 ${kind} from ${card.name}`, kind, spend: () => player.removeResourceFrom(card, 1, {log: true})});
      }
    }
    return result;
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && this.spendOptions(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new OrOptions(...this.spendOptions(player).map((option) => new SelectOption(`Spend ${option.label}`).andThen(() => {
      option.spend();
      const game = player.game;
      const cards = game.projectDeck.drawN(game, this.resourceCount);
      const matching = cards.filter((c) => c.tags.includes(MATCHING[option.kind]));
      const noneTaken = () => {
        game.projectDeck.discard(...cards);
        player.addResourceTo(this, {qty: 1, log: true});
        return undefined;
      };
      if (matching.length === 0) {
        game.log('${0} revealed ${1} cards with no ${2} tag', (b) => b.player(player).number(cards.length).string(option.kind));
        return noneTaken();
      }
      return new SelectCard(`Helix: take a card with a ${option.kind} tag (or none for +1 science)`, 'Take', matching, {min: 0, max: 1})
        .andThen((taken) => {
          if (taken.length === 0) {
            return noneTaken();
          }
          keep(player, taken, cards.filter((c) => !taken.includes(c)), LogType.DREW);
          return undefined;
        });
    }))).setTitle('Helix: spend a microbe, plant or animal');
  }
}
