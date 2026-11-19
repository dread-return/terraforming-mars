import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {IProjectCard} from '../IProjectCard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {ICard} from '../ICard';
import {PlayerInput} from '../../PlayerInput';

/** ROD Association: what each tag gives (the table printed on the card). */
const ROD_STOCK: Partial<Record<Tag, [Resource, number]>> = {
  [Tag.SPACE]: [Resource.TITANIUM, 1],
  [Tag.POWER]: [Resource.ENERGY, 1],
  [Tag.BUILDING]: [Resource.STEEL, 1],
  [Tag.JOVIAN]: [Resource.MEGACREDITS, 3],
  [Tag.EVENT]: [Resource.MEGACREDITS, 1],
  [Tag.PLANT]: [Resource.PLANTS, 1],
  [Tag.CITY]: [Resource.HEAT, 1],
  [Tag.EARTH]: [Resource.MEGACREDITS, 2],
  [Tag.MOON]: [Resource.MEGACREDITS, 2],
};
const ROD_CARD: Partial<Record<Tag, CardResource>> = {
  [Tag.RADIOACTIVE]: CardResource.RADIATION,
  [Tag.MARS]: CardResource.DATA,
  [Tag.VENUS]: CardResource.FLOATER,
  [Tag.MICROBE]: CardResource.MICROBE,
  [Tag.ANIMAL]: CardResource.ANIMAL,
};

const PRODUCTIONS: ReadonlyArray<Resource> = [
  Resource.MEGACREDITS,
  Resource.STEEL,
  Resource.TITANIUM,
  Resource.PLANTS,
  Resource.ENERGY,
  Resource.HEAT,
];

export class EpicUtils {
  /** Asks the player to raise `count` different productions 1 step each, one at a time. */
  public static gainDifferentProductions(player: IPlayer, count: number, card: ICard, exclude: Array<Resource> = []): void {
    if (count <= 0) {
      return;
    }
    const choices = PRODUCTIONS.filter((r) => !exclude.includes(r));
    player.defer(new OrOptions(
      ...choices.map((resource) => new SelectOption(`Increase your ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true, from: {card}});
        EpicUtils.gainDifferentProductions(player, count - 1, card, [...exclude, resource]);
        return undefined;
      })),
    ).setTitle(`${card.name}: choose a production to increase`));
  }

  /** An OrOptions to raise any one production 1 step. */
  public static gainAnyProduction(player: IPlayer, card: ICard, choices: ReadonlyArray<Resource> = PRODUCTIONS): PlayerInput {
    return new OrOptions(
      ...choices.map((resource) => new SelectOption(`Increase your ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true, from: {card}});
        return undefined;
      })),
    ).setTitle(`${card.name}: choose a production to increase`);
  }

  /** ROD Association: gain the resources for every tag on these cards. Card resources with no card to go on give 2 M€. */
  public static rodGain(player: IPlayer, cards: ReadonlyArray<IProjectCard>): void {
    for (const card of cards) {
      const tags = card.type === CardType.EVENT ? [Tag.EVENT, ...card.tags] : card.tags;
      for (const tag of tags) {
        const stock = ROD_STOCK[tag];
        const cardResource = ROD_CARD[tag];
        if (stock !== undefined) {
          player.stock.add(stock[0], stock[1], {log: true});
        } else if (cardResource !== undefined) {
          if (player.getResourceCards(cardResource).length > 0) {
            player.game.defer(new AddResourcesToCard(player, cardResource, {count: 1}));
          } else {
            player.stock.add(Resource.MEGACREDITS, 2, {log: true});
          }
        } else if (tag === Tag.SCIENCE) {
          player.drawCard();
        } else if (tag === Tag.WILD) {
          player.defer(new OrOptions(...[Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT]
            .map((r) => new SelectOption(`Gain 1 ${r}`).andThen(() => {
              player.stock.add(r, 1, {log: true});
              return undefined;
            }))).setTitle('ROD Association: wild tag, choose a resource'));
        }
      }
    }
  }
}
